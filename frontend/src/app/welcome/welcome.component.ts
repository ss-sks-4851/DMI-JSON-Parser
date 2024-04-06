// import { ApiService } from './../service/apiservice';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
Object: any;

  constructor(private http : HttpClient){}


  // gotoparse(){
  //   console.log(this.router.navigate(['parse']));
  // }
  @ViewChild('selectfile') el:ElementRef | undefined;   //in html we make variable of selectfile
  previewData: any;
  getResponse: boolean= false;
  objectLength: number = 0;
  showData : boolean = false;
 
  progress = { loaded : 0 , total : 0 };
  percentage: number =0 ;
  parsedData: any;
  public fileName: string ='' ;
  public fileType: string = '';
  public fileSize: number =0;
  public noOfColumns: number= 0;
  public showFilesDetails: boolean =false;


  ngOninIt(){
    this.showFilesDetails = false;
    this.fileName ="";
    this.parsedData="";
  }

  ngOnchanges(){
    this.ngOninIt();
  }

  // onFileChange(event: any) {
  //   const file = event.target.files[0];
  //   const formData = new FormData();
  //   this.progress = {loaded:0, total:0};
  //   this.percentage=0;
    // this.viewPreviewTable = false;
    // this.disableSave = true
    // this.columnDefs = [];
    // this.rowData = [];
    // this.getResponse = true;
    // this.columnList = [];
    // this.previewData =[];
    // this.parsedData = {}
    // this.selectedCheckboxes = [];
    // formData.append('uploadFile', file, file.name);

    // //this.dataSourceService.changeAddNewDsRemoveAllRefresh(true);
    // this.apiservce.post2('', formData).subscribe(
    //   (res) => {
    //     if(res.type === HttpEventType.UploadProgress ){
    //       this.progress.loaded = res.loaded
    //       this.progress.total = res.total
    //       this.percentage = Math.round(res.loaded/res.total*100);
    //     }
    //     else if(res.type === HttpEventType.Response){
    //       const event = res.body;
    //       console.log("body " + res.body);
    //       this.parsedData = event.structure;    
    //       console.log("parsedData " + event.structure); 
    //       this.showFilesDetails = true;
    //       this.fileName = event.fileName;
    //       this.fileType = event.fileType;
    //       this.fileSize = event.fileSize;
          // this.noOfColumns = event.noOfColumns;
          // this.hierarchyStatus = event.hierarchyStatus;
  //         this.previewData =(event.preview.length==0 && event.structure && Object.keys(event.structure).length > 0) ? [event.structure] : event.preview;
  //         this.getResponse = false;
  //         this.objectLength = Object.keys(this.parsedData).length;
  //       }      
  //     },
  //     (error) => {
  //       console.error('Error uploading file', error);
  //     }
  //   );
  // }

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    console.log(file.name);
    this.fileName=file.name;
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<any>('http://localhost:3000/parse', formData).subscribe(
      res => {
        console.log(res);
        if(res){
          this.showFilesDetails=true;
          this.parsedData = res;
          // this.parsedData=JSON.stringify(res);
          // console.log(this.parsedData);
        }
        // if(res.type === HttpEventType.UploadProgress ){
        //   this.progress.loaded = res.loaded
        //   this.progress.total = res.total
        //   this.percentage = Math.round(res.loaded/res.total*100);
        // }
        // else if(res.type === HttpEventType.Response){
        //   this.showFilesDetails = true;
        //   const event = res.body;
        //   console.log("body " + res.body);
        //   this.parsedData = event.structure;    
        //   console.log("parsedData " + event.structure); 
                
        //         // this.fileName = event.fileName;
        //   this.fileType = event.fileType;
        //   this.fileSize = event.fileSize;
        //   this.noOfColumns = event.noOfColumns;
        //         // this.hierarchyStatus = event.hierarchyStatus;
        //   this.previewData =(event.preview.length==0 && event.structure && Object.keys(event.structure).length > 0) ? [event.structure] : event.preview;
        //   this.getResponse = false;
        //   this.objectLength = Object.keys(this.parsedData).length;
        // }      
      });
    (        // Handle response data here
      error: any) => {
        console.error('Error uploading file:', error);
        // Handle error here
      }
  }

}
