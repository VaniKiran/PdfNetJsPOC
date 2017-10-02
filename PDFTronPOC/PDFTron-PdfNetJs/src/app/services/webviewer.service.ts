import { Injectable } from '@angular/core';
import { DocumentFile } from "../models/document-file";
declare let PDFTron: any;
let jQuery: any;
declare let PDFNet: any;
@Injectable()
export class WebviewerService {
    public instanceRef: any;
    viewerElement: any;
    documentFilesCache: Array<DocumentFile>;
    constructor( ) {
        this.documentFilesCache = new Array<DocumentFile>();
    }

    // are necessary variables present
    isInstance() {
        return PDFTron && this.instanceRef ? true : false;
    }

    initialize(metadataId: number, pageUrl: string, elementRef: any, showToolbar: boolean) {
        this.viewerElement = elementRef;
        // load the the PDFTron WebViewer
        if (PDFTron && elementRef) {
            this.instanceRef = new PDFTron.WebViewer({
                path: "../../../assets/vendor/webviewer",
                type: "html5",
                documentType: "pdf",
                l: "demo:tim.mcelwee@gmail.com:734952bd01dc5a54ad2ac8f69a48ac1eba072e03a943f6d085",
                streaming: true,
                enableAnnotations: true,
                showToolbarControl: showToolbar,
                initialDoc: pageUrl,
                config: "../../../assets/vendor/webviewer/config.js",
                pdfnet: true
            }, elementRef);

            return this.instanceRef;
        }
    }

    
   

    // push the new document URL to the instanciated WebViewer
    loadDocument(metadataId: number) {
        if (this.isInstance()) {
            this.expireOlderDocuments();
            let cachedFile = this.documentFilesCache.filter(df => df.metadataId === metadataId);
            if (cachedFile.length > 0) {
                cachedFile[0].cachedDatetime = new Date();
                this.injectToViewer(cachedFile[0].content);
            }
        }
    }

    cacheDownloadedFile(metadataId: number, fileConten: any): DocumentFile {
        let selectedDocumentFile = new DocumentFile();
        selectedDocumentFile.cachedDatetime = new Date();
        selectedDocumentFile.metadataId = metadataId;
        selectedDocumentFile.content = fileConten;
        this.documentFilesCache.push(selectedDocumentFile);

        return selectedDocumentFile;
    };

    expireOlderDocuments() {
        let currentDate = new Date();
        let expiredDocs = this.documentFilesCache.filter((cd) => {
            // todo: currently, expiring documents cached 4 hours ago,
            //       this method needs to be discussed.
            return currentDate.getHours() - cd.cachedDatetime.getHours() > 4;
        });
        expiredDocs.forEach(ed => {
            this.documentFilesCache.splice(this.documentFilesCache.indexOf(ed), 1);
        });
    }


    // rotate the current page clockwise
    rotateClockwise() {
        if (this.isInstance()) {
            this.instanceRef.rotateClockwise();
        }
    }

    // rotate the current page counterclockwise
    rotateCounterClockwise() {
        if (this.isInstance()) {
            this.instanceRef.rotateCounterClockwise();
        }
    }

    zoomIncrease()
    {
        if (this.isInstance()) {
            var current = this.instanceRef.getZoomLevel();
            if (current <= 3.69) {
                this.instanceRef.setZoomLevel(current + 0.1);
            }
        }
    }

    zoomDecrease() {
        if (this.isInstance()) {
            var current = this.instanceRef.getZoomLevel();
            if (current >= 0.49) {
                this.instanceRef.setZoomLevel(current - 0.1);
            }
        }
    }

    goToNextPage() {
        if (this.isInstance() && this.instanceRef.getPageCount()>1) {
            this.instanceRef.goToNextPage();
        }
    }
    
    goToPrevPage() {
        if (this.isInstance() && this.instanceRef.getPageCount() > 1) {
            this.instanceRef.goToPrevPage();
        }
    }

    // access internal iframe viewer controls
    private getDocViewer() {
        if (this.instanceRef) {
            var readerControl = this.instanceRef.getInstance();
            return readerControl.docViewer;
        }
    }

    injectToViewer(fileContent: Blob) {
        let typedBlob = new Blob([fileContent], { type: 'application/pdf' });
        let cachedUrl = URL.createObjectURL(typedBlob);
        this.instanceRef.loadDocument(cachedUrl);
    }


}
