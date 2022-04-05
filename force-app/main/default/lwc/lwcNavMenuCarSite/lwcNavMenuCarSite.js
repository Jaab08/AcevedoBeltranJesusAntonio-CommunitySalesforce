import { LightningElement} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import isguest from '@salesforce/user/isGuest';
import basePath from "@salesforce/community/basePath";

export default class LwcNavMenuCarSite extends NavigationMixin(LightningElement) {
    isGuestUser = isguest;

    homeUrl;
    carsUrl;
    appointmentUrl; 
    simulatorUrl;
    adminUrl;

    connectedCallback() {
        this.homePageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Home'
            }
        };
        this[NavigationMixin.GenerateUrl](this.homePageRef)
            .then(url => this.homeUrl = url);
        
        this.cars_modelPageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Cars_Models__c'
            }
        };
        this[NavigationMixin.GenerateUrl](this.cars_modelPageRef)
            .then(url => this.carsUrl = url);

        this.appointmentsPageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Appointments__c'
            }
        };
        this[NavigationMixin.GenerateUrl](this.appointmentsPageRef)
            .then(url => this.appointmentUrl = url);
        
        this.simulatorPageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Simulator__c'
            }
        };
        this[NavigationMixin.GenerateUrl](this.simulatorPageRef)
            .then(url => this.simulatorUrl = url);

        this.adminPageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Cars_Models_Admin__c'
            }
        };
        this[NavigationMixin.GenerateUrl](this.adminPageRef)
            .then(url => this.adminUrl = url);
    }

    get logoutLink() {
        const sitePrefix = basePath.replace(/\/s$/i, ""); // site prefix is the site base path without the trailing "/s"
        return sitePrefix + "/secur/logout.jsp";
    }
}