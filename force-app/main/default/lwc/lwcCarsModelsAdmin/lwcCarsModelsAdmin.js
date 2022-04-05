import { LightningElement, track, wire } from 'lwc';
import getCarProducts from '@salesforce/apex/ProductController.getCarsAdmin';
import updateProducts from '@salesforce/apex/ProductController.updateProducts';
import saveFile from '@salesforce/apex/UploadImage.saveFile';
import { createRecord } from 'lightning/uiRecordApi';
import MAIN_OBJECT from '@salesforce/schema/Product2';
import NAME_FIELD from '@salesforce/schema/Product2.Name';
import MODEL_FIELD from '@salesforce/schema/Product2.Model__c';
import BRAND_FIELD from '@salesforce/schema/Product2.Brand__c';
import COLOR_FIELD from '@salesforce/schema/Product2.Color__c';
import PRICE_FIELD from '@salesforce/schema/Product2.Price__c';
import ISACTIVE_FIELD from '@salesforce/schema/Product2.IsActive';

import { refreshApex } from '@salesforce/apex';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LwcCarsModelsAdmin extends LightningElement {
    @track error;
    @track openModal = false;
    @track columns = [
        { label: 'Model', fieldName: 'Model__c', type: 'text', editable: true },
        { label: 'Brand', fieldName: 'Brand__c', type: 'text', editable: true},
        { label: 'Image', fieldName: 'DisplayUrl', type: 'image', editable: true},
        { label: 'Color', fieldName: 'Color__c', type: 'text', editable: true},
        { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
        { label: 'Is Active', fieldName: 'IsActive', type: 'boolean', editable: true}
    ];
    rowOffset = 0;
    @track draftValues = [];

    carName = '';
    model = '';
    brand = '';
    color = '';
    price = '0.00';
    isActive = false;

    @track fields = {};

    @track fileName = '';
    @track UploadFile = 'Upload Image';
    filesUploaded = [];
    file;
    fileContents;
    fileReader;
    content;
    MAX_FILE_SIZE = 1500000;
    @track imageUrl;
    
    get acceptedFormats() {
        return ['.jpg', '.png', '.jpeg'];
    }

    get models() {
        return [
            { label: 'None', value: '' },
            { label: 'Micro', value: 'Micro' },
            { label: 'Sedan', value: 'Sedan' },
            { label: 'CUV', value: 'CUV' },
            { label: 'SUV', value: 'SUV' },
            { label: 'Hatchback', value: 'Hatchback' },
            { label: 'Roadster', value: 'Roadster' },
            { label: 'Pickup', value: 'Pickup' },
            { label: 'Van', value: 'Van' },
            { label: 'Minivan', value: 'Minivan' },
            { label: 'Coupe', value: 'Coupe' },
            { label: 'Sport', value: 'Sport' },
            { label: 'Camper', value: 'Camper' },
        ];
    }

    get brands() {
        return [
            { label: 'None', value: '' },
            { label: 'Ford', value: 'Ford' },
            { label: 'Chevrolet', value: 'Chevrolet' },
            { label: 'Honda', value: 'Honda' },
            { label: 'Toyota', value: 'Toyota' },
            { label: 'Jeep', value: 'Jeep' },
            { label: 'BMW', value: 'BMW' },
            { label: 'Nissan', value: 'Nissan' },
            { label: 'Volkswagen', value: 'Volkswagen' },
            { label: 'Tesla', value: 'Tesla' },
            { label: 'Chrysler', value: 'Chrysler' },
        ];
    }

    get colors() {
        return [
            { label: 'None', value: '' },
            { label: 'Red', value: 'Red' },
            { label: 'Blue', value: 'Blue' },
            { label: 'Green', value: 'Green' },
            { label: 'Yellow', value: 'Yellow' },
            { label: 'Orange', value: 'Orange' },
            { label: 'Purple', value: 'Purple' },
            { label: 'Brown', value: 'Brown' },
            { label: 'Black', value: 'Black' },
            { label: 'White', value: 'White' },
            { label: 'Silver', value: 'Silver' },
            { label: 'Gray', value: 'Gray' },
        ];
    }

    @wire(getCarProducts, {model: '$model', brand: '$brand'}) 
    products;

    handleChangeFilter(event) {
        if (event.target.name == 'model') {
            this.model = event.target.value;
        }
        if (event.target.name == 'brand') {
            this.brand = event.target.value;
        }
    }

    handleChangeNewCarForm(event) {
        if (event.target.name == 'nameProduct') {
            this.carName = event.target.value;
        }
        if (event.target.name == 'newModel') {
            this.model = event.target.value;
        }
        if (event.target.name == 'newBrand') {
            this.brand = event.target.value;
        } 
        if (event.target.name == 'color') {
            this.color = event.target.value;
        } 
        if (event.target.name == 'price') {
            this.price = event.target.value;
        } 
        if (event.target.name == 'isActive') {
            this.isActive = event.target.checked;
        } 
    }

    handleClickNewCar(even) {
        this.model = '';
        this.brand = '';
        this.openModal = true;
    }

    handleCloseModal() {
        this.model = '';
        this.brand = '';
        this.products = {};
        this.openModal = false;
        refreshApex(this.products);
    }

    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
        }
    }

    uploadHelper(parent) {
        this.file = this.filesUploaded[0];
        if (this.file.size > this.MAX_FILE_SIZE) {
            window.console.log('File Size is to long');
            return;
        }

        // create a FileReader object 
        this.fileReader = new FileReader();
        // set onload function of FileReader object  
        this.fileReader.onloadend = (() => {
            this.fileContents = this.fileReader.result;
            let base64 = 'base64,';
            this.content = this.fileContents.indexOf(base64) + base64.length;
            this.fileContents = this.fileContents.substring(this.content);

            // call the uploadProcess method 
            window.console.log('Upload Helper!!' + parent);
            this.saveToFile(parent);
        });

        this.fileReader.readAsDataURL(this.file);
    }

    saveToFile(parent) {
        saveFile({ idParent: this.recordId, idCar: parent, strFileName: this.file.name, base64Data: encodeURIComponent(this.fileContents) })
            .then(result => {
                window.console.log('result ====> ' + result);
                window.console.log('Save to File');

                this.fileName = this.fileName + ' - Uploaded Successfully';
                this.UploadFile = 'File Uploaded Successfully';

                // Showing Success message after file insert
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!!',
                        message: this.file.name + ' - Uploaded Successfully!!!',
                        variant: 'success',
                    }),
                );

            })
            .catch(error => {
                // Showing errors if any while inserting the files
                window.console.log('Error!!');
                window.console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while uploading File',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }

    handleSave(parent){
        if (this.filesUploaded.length > 0) {
            window.console.log('Handle Save!!' + parent);
            this.uploadHelper(parent);
        }
        else {
            this.fileName = 'Please select file to upload!!';
        }
    }

    saveProduct() {
        this.fields[NAME_FIELD.fieldApiName] = this.carName;
        this.fields[MODEL_FIELD.fieldApiName] = this.model;
        this.fields[BRAND_FIELD.fieldApiName] = this.brand;
        this.fields[COLOR_FIELD.fieldApiName] = this.color;
        this.fields[PRICE_FIELD.fieldApiName] = this.price;
        this.fields[ISACTIVE_FIELD.fieldApiName] = this.isActive;
       
        createRecord({ apiName: MAIN_OBJECT.objectApiName, fields: this.fields })
            .then(productObj=> {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Product record has been created ' + productObj.id,
                        variant: 'success'
                    })
                );
                this.handleSave(productObj.id);
                this.handleCloseModal();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }

    async handleUpdate(event) {
        const updatedFields = event.detail.draftValues;
        
        // Prepare the record IDs for getRecordNotifyChange()
        const notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });
    
        try {
            // Pass edited fields to the updateProducts Apex controller
            const result = await updateProducts({data: updatedFields});
            console.log(JSON.stringify("Apex update result: "+ result));
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Product updated',
                    variant: 'success'
                })
            );
    
            // Refresh LDS cache and wires
            getRecordNotifyChange(notifyChangeIds);
    
            // Display fresh data in the datatable
            refreshApex(this.products).then(() => {
                // Clear all draft values in the datatable
                this.draftValues = [];
            });
       } catch(error) {
               this.dispatchEvent(
                   new ShowToastEvent({
                       title: 'Error updating or refreshing records',
                       message: error.body.message,
                       variant: 'error'
                   })
             );
        };
    }
}