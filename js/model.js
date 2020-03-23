class AppType{
    constructor(id, name, orderIndex, description){
        this.id = id;
        this.name = name;
        this.orderIndex = orderIndex;
        this.description = description;
    };

    getID() { return this.id; };
    getName() { return this.name; };
    getOrderIndex() { return this.orderIndex; };
    getDescription() { return this.description; };
};

class Category{
    constructor(id, name, description, fields){
        this.id = id;
        this.name = name;
        this.description = description;
        this.fields = fields; // characteristics
    };

    getID() { return this.id; };
    getName() { return this.name; };
    getFields(){ return this.fields; };
    getDescription() { return this.description; };
    addField(field){ this.fields.push(field); };

    getAllOptionalFields(appOrderIndex){
        return this.fields.filter(function(field){
            return field.getClassByAppOrdexIndex(appOrderIndex) == 0;
        });
    };

    getAllEssentialFields(appOrderIndex){
        return this.fields.filter(function(field){
            return field.getClassByAppOrdexIndex(appOrderIndex) == 1;
        });
    };
};

class Field{
    constructor(name, cname, fname, jtype, sensorInfo, classByAppType){
        this.name = name;
        this.cname = cname;
        this.fname = fname;
        this.jtype = jtype;
        /* None or something like @sensor(['GPS']) */
        this.sensorInfo = sensorInfo;
        /* -1: none, 0: optional, 1: essential */
        this.classByAppType = classByAppType;
    }

    getName() { return this.name; };
    getCname() { return this.cname; };
    getFname() { return this.fname; };
    getJtype() { return this.jtype; };
    getSensorInfo() { return this.sensorInfo; };
    getClassByAppType() { return this.classByAppType; };
    getClassByAppOrdexIndex(i) { return this.classByAppType[i]; };
};

class TaxTool{
    constructor(taxData){
        this.taxData = taxData.feed.entry;

        this.appsType = [];     // class AppType
        this.categories = [];   // class Category

        this.userChoice = {
            appType: null,
            tLang: null,
            cats: []
        };

        /* Getting applications types from spreadsheet data */
        var orderIndex = 0;
        for(var i = 9; i <= 15; i++){
            var appTypeData = this.taxData.filter(
                element => (element["gs$cell"]["col"] == i && element["gs$cell"]["row"] <= 3)
            );
            var id = appTypeData[0]["gs$cell"]["$t"];
            var name = appTypeData[1]["gs$cell"]["$t"];
            var description = appTypeData[2]["gs$cell"]["$t"];
            this.appsType.push(new AppType(id, name, orderIndex, description));
            orderIndex++;
        }

        /* Getting categories from spreadsheet data */
        var lineBegin = 4;
        var categoryData = this.taxData.filter(
            element => (element["gs$cell"]["row"] == lineBegin)
        );
        while(categoryData.length > 0){
            var catID = categoryData[0]["gs$cell"]["$t"];
            var cat = this.getCategoryByID(catID);
            var isNew = false;
            if(!cat){
                var name = categoryData[1]["gs$cell"]["$t"];
                var description = categoryData[2]["gs$cell"]["$t"];
                cat = new Category(catID, name, description, []);
                isNew = true;
            }

            var finame = categoryData[3]["gs$cell"]["$t"];
            var cname = categoryData[4]["gs$cell"]["$t"];
            var fname = categoryData[5]["gs$cell"]["$t"];
            var jtype = categoryData[6]["gs$cell"]["$t"];
            var sensorInfo = categoryData[7]["gs$cell"]["$t"];
            var classByAppType = [];
            for(var c = 8; c < this.appsType.length + 8; c++){
                 /* -1: none, 0: optional, 1: essential */
                 var cAP = categoryData[c]["gs$cell"]["$t"];
                 if(cAP.toUpperCase().trim() === 'ESSENTIAL'){
                    classByAppType.push(1);
                 }else if(cAP.toUpperCase().trim() === 'OPTIONAL'){
                    classByAppType.push(0);
                 }else{
                    classByAppType.push(-1);
                 }
            }

            cat.addField(new Field(finame, cname, fname, jtype, sensorInfo, classByAppType));
            if(isNew) this.categories.push(cat);

            lineBegin++;
            categoryData = this.taxData.filter(
                element => (element["gs$cell"]["row"] == lineBegin)
            ); 
        }

        //console.log(this);
    };

    getAppsType(){ return this.appsType; };
    getCategories(){ return this.categories; };
    getCategoryByID(id){ 
        var result = this.categories.filter(cat => cat.id == id);
        if(result.length == 1){
            return result[0];
        }
        return null;
    };

    clearUserChoice(){
        this.userChoice = {
            appType: null,
            tLang: null,
            cats: []
        };
    };
    getUserChoice(){
        return this.userChoice;
    };
    setAppTypeInUserChoice(appType){
        var result = this.appsType.filter(at => at.id == appType);
        if(result.length == 1){
            this.userChoice.appType = result[0];
        }
    };
    setTLangInUserChoice(language){
        this.userChoice.tLang = language;
    };
    pushAllCategoriesInUserChoice(categories){
        categories.forEach(catID => {
            var result = this.categories.filter(cat => cat.id == catID);
            if(result.length == 1){
                this.userChoice.cats.push(result[0]);
            }
        });
    };
    toStringUserChoice(){
        console.log(this.userChoice);
    };
}

function getDataSource(){
    return "https://spreadsheets.google.com/feeds/cells/1xOi_b6MZWOSogE5RoO5sHo3ZBtcBQnPunuYWja155gk/1/public/values?alt=json";
}