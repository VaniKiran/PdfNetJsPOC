import { Component, ViewChild } from '@angular/core';
import { DocumentMetaData } from "./models/document-metadata";
import { LocalPhysicalFile } from "./models/local-physical-file";
import { WebviewerService } from "./services/webviewer.service";
 declare var jQuery: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    @ViewChild('fileInput') fileInput: any;
    files: File[];
    uploadDocuments: Array<DocumentMetaData>;
    localPhysicalFileCache: Array<LocalPhysicalFile>;
    pdfWebViewer: any;
    selectedDocArray = [];
    IsHidden: boolean = false;
   
    constructor(private _webviewerService: WebviewerService)
    {

    }
    ngOnInit() {
        this.uploadDocuments = [];
        this.localPhysicalFileCache = [];
        //jQuery(document).on('documentLoaded', (event) => {
        //    this._webviewerService.test()
        //});
    }
    onFileSelected(event: any) {
        this.files = event.target.files;

        // this.buildFileItemQueueFromFileInput(event);
        var displayFile = this.files[0];

        for (var i = 0; i < this.files.length; i++) {
            var docId = this.generateGuid();
            this.buildFileList(this.files[i].name, docId);
            this.cacheAddedFile(this.files[i]);
        }
            this.loadCurrentFile(displayFile);
    }

    public generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private buildFileList(fileName: string, docId: string) {
        let addedDocs = [];
        let uploadDoc = new DocumentMetaData();
        uploadDoc.Guid = docId; //this._documentListFilterService.generateGuid();
        uploadDoc.DocumentName = "Unknown(" + fileName + ")";
        uploadDoc.FileName = fileName;
        addedDocs.push(uploadDoc);
        this.uploadDocuments.push(uploadDoc);
    }

    private cacheAddedFile(file: any) {
        var fileReader = new FileReader();
        fileReader.onloadend = () => {
            let fileContent = fileReader.result;
            var physicalFile = new LocalPhysicalFile();
            physicalFile.name = file.name;
            physicalFile.content = fileContent;
            physicalFile.mediaType = "application/pdf";
            this.localPhysicalFileCache.push(physicalFile);
        }
        fileReader.readAsArrayBuffer(file);
    }

    private loadCurrentFile(displayFile: any) {
        var fileReader = new FileReader();
        fileReader.onloadend = () => {
            let fileContent = fileReader.result;
            let typedBlob = new Blob([fileContent], { type: 'application/pdf' });
            if (this.pdfWebViewer) {
                this._webviewerService.injectToViewer(typedBlob);
            } else {
                let viewerElement = document.getElementById("uploadDocViewer");
                let cachedUrl = URL.createObjectURL(typedBlob);
                this.pdfWebViewer = this._webviewerService.initialize(0, cachedUrl, viewerElement, false);
            }
        }
        fileReader.readAsArrayBuffer(displayFile);
    }

    private loadSelectedFile(physicalFile: any) {
        let typedBlob = new Blob([physicalFile.content], { type: physicalFile.mediaType });

        if (this.pdfWebViewer) {
            this._webviewerService.injectToViewer(typedBlob);
        } else {
            let viewerElement = document.getElementById("uploadDocViewer");
            // intialized the viewer because this is the first call
            let cachedUrl = URL.createObjectURL(typedBlob);
            this.pdfWebViewer = this._webviewerService.initialize(0, cachedUrl, viewerElement, false);
        }
    }

    removeFileFromQueue(item: any) {
        if (item !== 'undefined') {
            var index = this.uploadDocuments.indexOf(item);
            this.uploadDocuments.splice(index, 1);  // remove from file list
            this.removeSelectedFile(item.Guid);  // remove from file cache

            let removedDocs = [];
            item.Guid = 'remove';
            removedDocs.push(item);
        }
    }

    private removeSelectedFile(docGuid: string) {
        let selectedDoc = this.uploadDocuments.find(d => d.Guid === docGuid);
       
        var selectedPhysicalFile = this.localPhysicalFileCache.filter(p => p.name === selectedDoc.FileName)[0];
        if (typeof selectedPhysicalFile === typeof undefined) {
            return;
        }

        // Remove from the cached file array
        var index = this.localPhysicalFileCache.indexOf(selectedPhysicalFile);
        this.localPhysicalFileCache.splice(index, 1);
        this.fileInput.nativeElement.value = "";

        // load first doc in cache
        if (this.localPhysicalFileCache.length > 0) {
            this.loadSelectedFile(this.localPhysicalFileCache[0]);
        }
        else {
            this.uploadDocuments = [];
            this.localPhysicalFileCache = [];
            this.IsHidden = true;
        }
    }

    toggleItemInArr(arr, item) {
        const index = arr.indexOf(item);
        index === - 1 ? arr.push(item) : arr.splice(index, 1);
    }

    addThisDocToArray(document: any, event) {
        if (!event.ctrlKey) {
            this.selectedDocArray = [];
        }
        this.toggleItemInArr(this.selectedDocArray, document);
    }

    isDocSelected(document: any) {
        return this.selectedDocArray.indexOf(document) !== -1;
    }
    zoomDecrease() {
        this._webviewerService.zoomDecrease();
    }

    zoomIncrease() {
        this._webviewerService.zoomIncrease();
    }

    goToNextPage() {
        this._webviewerService.goToNextPage();
    }

    goToPrevPage() {
        this._webviewerService.goToPrevPage();
    }

   
}
