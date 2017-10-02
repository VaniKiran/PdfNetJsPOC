(function() {

    // adjust visible UI components through ReaderControl.config
    $.extend(ReaderControl.config, {
        //configuration options go here
        ui: {
            // main UI elements
            hideAnnotationPanel: true,
            hideControlBar: false,
            hideSidePanel: true,
            // UI subelements
            hideDisplayModes: false,
            hideZoom: false,
            hideTextSearch: true,
            hidePrint: true
        }
    });

    // set up persistant page rotation per the PDFTron forumn
    // https://groups.google.com/forum/#!msg/pdfnet-webviewer/mpD_r0wHAYg/tNinh5_HAgAJ
    ReaderControl.prototype.rotateClockwise = function() {
        rotatePages(1);
    }

    ReaderControl.prototype.rotateCounterClockwise = function() {
        rotatePages(-1);
    }

    function getAllPagesArray() {
        var allPages = [];
        for (var i = 0; i < readerControl.docViewer.getPageCount(); ++i) {
            allPages.push(i + 1);
        }
        return allPages;
    }

    function getCurrentPageArray() {
        var currentPage = readerControl.docViewer.getCurrentPage();
        // console.log('config | getcurrentPageArray:', [currentPage]);
        return [currentPage];
    }

    function rotatePages(dir) {
        var docViewer = readerControl.docViewer;
        // console.log('config | rotatePages', docViewer, dir);
        var doc = docViewer.getDocument();

        var newRotation = (docViewer.getRotation() + dir) % 4;
        if (newRotation === -1) {
            newRotation = 3;
        }

        // alert angular app that rotation has occured
        parent.postMessage({
            'usfsApp': 'dms',
            'type': 'webviewer',
            'event': 'rotatePages',
            'data': 'function'
        }, '*');

        doc.rotatePages(getCurrentPageArray(), newRotation);
    }

    // alert other parts of the application of inner PDFTron event completion
    // via postMessage
    $(document).on('viewerLoaded', function() {
        // the current page has changed in the viewer
        readerControl.docViewer.on('pageNumberUpdated', function() {
            var currentPage = readerControl.docViewer.getCurrentPage();
            parent.postMessage({
                'usfsApp': 'dms',
                'type': 'webviewer',
                'event': 'pageNumberUpdated',
                'data': '' + currentPage + ''
            }, '*');
        });
    });

    // PDFTron document has fully loaded
    $(document).on('documentLoaded', function() {
        parent.postMessage({
            'usfsApp': 'dms',
            'type': 'webviewer',
            'event': 'documentLoaded',
            'data': ''
        }, '*');
        test();
    });
    function test() {
        PDFNet.initialize().then(function () {
            var doc = yield PDFNet.PDFDoc.create();         // creates an empty pdf document
            doc.initSecurityHandler();                      // initializes security handler
            doc.lock();
            // insert user code after this point
            var pgnum = yield doc.getPageCount();
            alert("Test Complete! Your file has " + pgnum + " pages");
        });
        //var in_doc = yield PDFNet.PDFDoc.createFromURL("C:/temp/PeirsonPatterson.pdf");
        //in_doc.initSecurityHandler();
        //in_doc.lock();

        //console.log("PDF document initialized and locked");

        //var page_count = yield in_doc.getPageCount();
        //console.log('page_count', page_count);
        //var pages_to_split = Math.min(4, page_count);

        //// docStoreArray is used to leep track of the documents we have split up for later use.
        //var docStoreArray = [];
        //for (var i = 1; i <= pages_to_split; ++i) {
        //    var new_doc = yield PDFNet.PDFDoc.create();
        //    var filename = "newsletter_split_page_" + i + ".pdf";
        //    new_doc.insertPages(0, in_doc, i, i, PDFNet.PDFDoc.InsertFlag.e_none);
        //    docStoreArray[i - 1] = new_doc;
        //    var docbuf = yield new_doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_linearized);
        //    saveBufferAsPDFDoc(docbuf, filename);
        //    console.log("Result saved as " + filename);
        //}
    }
})();