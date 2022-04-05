import { LightningElement, track, wire } from 'lwc';
import getCarProducts from '@salesforce/apex/ProductController.getCars';

export default class LwcDataTableCarSite extends LightningElement {
    @track products = [];
    @track error;
    @track columns = [
        { label: 'Model', fieldName: 'Model__c', type: 'text' },
        { label: 'Brand', fieldName: 'Brand__c', type: 'text'},
        { label: 'Image', fieldName: 'DisplayUrl', type: 'image' },
        { label: 'Color', fieldName: 'Color__c', type: 'text'},
        { label: 'Price', fieldName: 'Price__c', type: 'currency' }
    ];
    rowOffset = 0;

    model = '';
    brand = '';
    
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

    handleChangeFilter(event) {
        if (event.target.name == 'model') {
            this.model = event.target.value;
        }
        if (event.target.name == 'brand') {
            this.brand = event.target.value;
        }
    }

    @wire(getCarProducts, {model: '$model', brand: '$brand'})
    products;
}