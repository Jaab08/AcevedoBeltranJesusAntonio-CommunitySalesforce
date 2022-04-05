public with sharing class ProductController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getCarsAdmin(String model, String brand){
        if (model != '' && brand == '') {
            return [
                SELECT Model__c, Brand__c, Color__c, DisplayUrl, IsActive, Price__c 
                FROM Product2 
                WHERE Model__c = :model
            ];  
        } else if (model == '' && brand != '') {
            return [
                SELECT Model__c, Brand__c, Color__c, DisplayUrl, IsActive, Price__c 
                FROM Product2 
                WHERE Brand__c = :brand
            ];
        } else if (model != '' && brand != '') {
            return [
                SELECT Model__c, Brand__c, Color__c, DisplayUrl, IsActive, Price__c 
                FROM Product2 
                WHERE Model__c = :model AND Brand__c = :brand
            ];           
        } else {
            return [
                SELECT Model__c, Brand__c, Color__c, DisplayUrl, IsActive, Price__c 
                FROM Product2 
                WHERE Model__c != NULL
            ]; 
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Product2> getCars(String model, String brand){
        if (model != '' && brand == '') {
            return [
                SELECT Model__c, Brand__c, Color__c, DisplayUrl, IsActive, Price__c 
                FROM Product2 
                WHERE Model__c = :model AND IsActive = true
            ];  
        } else if (model == '' && brand != '') {
            return [
                SELECT Model__c, Brand__c, Color__c, DisplayUrl, IsActive, Price__c 
                FROM Product2 
                WHERE Brand__c = :brand AND IsActive = true 
            ];
        } else if (model != '' && brand != '') {
            return [
                SELECT Model__c, Brand__c, Color__c, DisplayUrl, IsActive, Price__c 
                FROM Product2 
                WHERE Model__c = :model AND Brand__c = :brand AND IsActive = true
            ];           
        } else {
            return [
                SELECT Model__c, Brand__c, Color__c, DisplayUrl, IsActive, Price__c 
                FROM Product2 
                WHERE Model__c != NULL AND IsActive = true
            ]; 
        }
    }

    @AuraEnabled
    public static string updateProducts(Object data) {
        List<Product2> productsForUpdate = (List<Product2>) JSON.deserialize(
             JSON.serialize(data),
             List<Product2>.class
        );
        try {
            update productsForUpdate;
            return 'Success: products updated successfully';
        }
        catch (Exception e) {
            return 'The following exception has occurred: ' + e.getMessage();
        }
    }
}