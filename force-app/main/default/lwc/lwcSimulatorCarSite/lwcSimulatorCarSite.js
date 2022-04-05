import { LightningElement, track } from 'lwc';
import {loadScript} from "lightning/platformResourceLoader";
import jspdf from '@salesforce/resourceUrl/jspdf';
import autotable from '@salesforce/resourceUrl/jspdf_autotable'

export default class LwcSimulatorCarSite extends LightningElement {
    @track model = '';
    @track amount;
    @track downPayment;
    @track noTerms;
    disabled = true;
    @track data = [];

    dataIsReady = false;

    @track termsList = [{ label: 'None', value: '' }];

    @track columns = [
        { label: 'Unpaid Auto Balance', fieldName: 'unpaidAutoBalance', type: 'currency' },
        { label: 'Monthly Auto Capital Payment', fieldName: 'monthlyAutoCapitalPayment', type: 'currency'},
        { label: 'Monthly Payment of Auto Interest', fieldName: 'monthylPaymentOfAutoInterest', type: 'currency' },
        { label: 'Total Payment with VAT', fieldName: 'totalPaymentWithVat', type: 'currency'}
    ];
    rowOffset = 0;

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

    get terms() {
        for (let index = 12; index <= 96; index+=12) {
            this.termsList.push({label: index.toString(), value: index.toString() });  
        }

        return this.termsList;
    }

    handleChangeModel(event) {
        this.model = event.detail.value;
    }

    handleChangeAmount(event) {
        this.amount = event.detail.value;
    }

    handleChangeDownPayment(event) {
        this.downPayment = event.detail.value;
    }

    handleChangeTerm(event) {
        this.noTerms = event.detail.value;
    }

    handleClick() {
        this.data = [];
        let monthlyPayment = 0;
        let unpaidBalance = 0;
        let monthlyInterest = 0;
        let totalWithVat = 0;

        monthlyPayment = (this.amount - this.downPayment)/this.noTerms;
        unpaidBalance = this.amount - this.downPayment;
        monthlyInterest = monthlyPayment*0.10;
        totalWithVat = monthlyPayment + monthlyInterest;

        for (let i = 0; i < this.noTerms; i++) {
            this.data.push({
                unpaidAutoBalance: unpaidBalance,
                monthlyAutoCapitalPayment: monthlyPayment,
                monthylPaymentOfAutoInterest: monthlyInterest,
                totalPaymentWithVat: totalWithVat
            });
            unpaidBalance -= monthlyPayment;
        }

        this.dataIsReady = true;
        this.disabled = false;
    }

    downloadCSV() {   
        let rowEnd = '\n';
        let csvString = '';
        // this set elminates the duplicates if have any duplicate keys
        let rowData = new Set();

        // getting keys from data
        this.data.forEach(function (record) {
            Object.keys(record).forEach(function (key) {
                rowData.add(key);
            });
        });

        // Array.from() method returns an Array object from any object with a length property or an iterable object.
        rowData = Array.from(rowData);
        
        // splitting using ','
        csvString += rowData.join(',');
        csvString += rowEnd;

        // main for loop to get the data based on key value
        for(let i=0; i < this.data.length; i++){
            let colValue = 0;

            // validating keys in data
            for(let key in rowData) {
                if(rowData.hasOwnProperty(key)) {
                    // Key value 
                    // Ex: Id, Name
                    let rowKey = rowData[key];
                    // add , after every value except the first.
                    if(colValue > 0){
                        csvString += ',';
                    }
                    // If the column is undefined, it as blank in the CSV file.
                    let value = this.data[i][rowKey] === undefined ? '' : this.data[i][rowKey];
                    csvString += '"'+ value +'"';
                    colValue++;
                }
            }
            csvString += rowEnd;
        }

        // Creating anchor element to download
        let downloadElement = document.createElement('a');

        // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        downloadElement.target = '_self';
        // CSV File Name
        downloadElement.download = 'Down Payment Data.csv';
        // below statement is required if you are using firefox browser
        document.body.appendChild(downloadElement);
        // click() Javascript function to download CSV file
        downloadElement.click(); 
    }

    createHeaders(keys) {
        var result = [];
        for (var i = 0; i < keys.length; i += 1) {
            result.push({
                id: keys[i],
                name: keys[i],
                prompt: keys[i],
                width: 55,
                align: "center",
                padding: 0
            });
        }
        return result;
    }

    renderedCallback() {
        Promise.all([
            loadScript(this, jspdf),
            loadScript(this, autotable)
        ]);
    }

    headRows() {
        return [{ 
            unpaidAutoBalance: 'Unpaid Auto Balance', 
            monthlyAutoCapitalPayment: 'Monthly Auto Capital Payment', 
            monthylPaymentOfAutoInterest: 'Monthly Payment of Auto Interest', 
            totalPaymentWithVat: 'Total Payment with VAT',
        }]
    }

    downloadPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            encryption: {
                userPermissions: ["print", "modify", "copy", "annot-forms"]
            }
        });

        //doc.text('Simulator')
        doc.autoTable({
            head: this.headRows(),
            body: this.data,
            theme: 'grid',
        })

        window.console.log(JSON.stringify(this.data));
        window.console.log(JSON.stringify(this.headRows()));
        doc.save("simulator.pdf");
    }
}