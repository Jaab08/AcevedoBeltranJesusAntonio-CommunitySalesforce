public with sharing class UploadImage {
    @AuraEnabled
    public static String saveFile(Id idParent, Id idCar, String strFileName, String base64Data) {
        // Decoding base64Data
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        
        // inserting file
        ContentVersion cv = new ContentVersion();
        cv.Title = strFileName;
        cv.PathOnClient = '/' + strFileName;
        cv.FirstPublishLocationId = idParent;
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        cv.IsMajorVersion = true;
        Insert cv;
        //return cv;

        ContentDistribution cdl = new ContentDistribution();
        cdl.ContentVersionId = cv.Id;
        cdl.Name = 'PublicShare';
        insert cdl;
        Product2 p = new Product2();
        p.Id = idCar;
        //system.debug(idCar);
        p.DisplayUrl = [SELECT DistributionPublicUrl, ContentDownloadUrl FROM ContentDistribution WHERE Id = :cdl.Id LIMIT 1].ContentDownloadUrl;
        update p;
        //system.debug(p.DisplayUrl);
        return [SELECT DistributionPublicUrl, ContentDownloadUrl FROM ContentDistribution WHERE Id = :cdl.Id LIMIT 1].ContentDownloadUrl;
    }
}
