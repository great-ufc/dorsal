(function ($) {
    "use strict";
    var taxtool = null;

    function loadModel(){
        $.get(getDataSource(), function(data) {
            taxtool = new TaxTool(data);
            appsTypeSelect(taxtool.getAppsType());
            fillTheCards(taxtool);
            linkCAT02AndCAT05();
            applySubmitEvent();
            applyCheckAndUncheckEvents();
        });
    };

    function linkCAT02AndCAT05(){
        $($('input[value="CAT02"]')[0]).change(function(){
            if($(this).prop('checked')){
               $($('input[value="CAT05"]')[0]).bootstrapToggle('on');
            }
         });
    };

    function applyCheckAndUncheckEvents(){
        $('#checkAllBtn').on('click', function(){
            $('.selectCategory').bootstrapToggle('on');
        });
        $('#uncheckAllBtn').on('click', function(){
            $('.selectCategory').bootstrapToggle('off');
        });
    };

    function applySubmitEvent(){
        var $submitBtn = $('#submitBtn');
        $submitBtn.attr("disabled", false);

        $submitBtn.on('click', function(){
            var selectedCategories = [];
            $('.selectCategory:checked').each(function() {
                selectedCategories.push($(this).val());
             });

             var appType = $("#applicationTypeSelect").val();
             var language = $("#targetProgLangSelect").val();
            if(appType != 'Null' && language != 'Null' &&
                selectedCategories.length > 0){
                // Generate the code
                taxtool.clearUserChoice();
                taxtool.setAppTypeInUserChoice(appType);
                taxtool.setTLangInUserChoice(language);
                taxtool.pushAllCategoriesInUserChoice(selectedCategories);
                // Just to check
                //taxtool.toStringUserChoice();
                if(language == 'java'){
                    applyJavaTemplate();
                }

                //alert('Calma garoto... I\' working on it!');
            }else{
                alert('Please, you must select the application type, the target language and at least one data category.');
            }
        });
    };

    function appsTypeSelect(appsType){
        var $dropdown = $("#applicationTypeSelect");
        $.each(appsType, function() {
            $dropdown.append($("<option />").val(this.id).text(this.name));
        });

        $dropdown.change(function(){
            if($(this).val() == 'Null'){
                $("#appsTypeDiv").fadeOut();
            }else{
                $("#appsTypeDiv").fadeIn();
                $('.my-toggle').bootstrapToggle();
            }
        });
    };

    function fillTheCards(taxtool){
        var count = 0;
            var cardsRow = '<div class="row my-cards-row">'; 
            taxtool.getCategories().forEach(function(category){
                if(count != 0 && count % 6 == 0){
                    cardsRow += '</div>';
                    $('#appsTypeDiv').append(cardsRow);
                    cardsRow = '<div class="row my-cards-row">';
                }

                cardsRow += createCard(category.getID(), category.getName(), category.getDescription());
                count++;
            });

            if(taxtool.getCategories().length % 6 != 0){
                cardsRow += '</div>';
                $('#appsTypeDiv').append(cardsRow);
            }
    };

    function ucFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    function applyJavaTemplate(){
        Promise.all([
            fetch('js/templates/jclass.jst').then(template => template.text())
        ]).then(([jClassTemplate]) => {
            var data = taxtool.getUserChoice();
            var tmpModel = {
                toolName: 'ehealth-taxtool',
                appType: data.appType,
                creationDate: new Date().toISOString(),
                jclasses: []
            };
            data.cats.forEach(function(category){
                category.getFields()
                .filter(f => f.classByAppType[data.appType.orderIndex] >= 0)
                .forEach(function(field){
                    field['opDesc'] = (field.classByAppType[data.appType.orderIndex] == 1) ? 'Essential' : 'Optional';
                    field['fnameC'] = ucFirst(field.getFname());
                    var astBool = field.getCname().includes('*');
                    var cname = (astBool) ? field.getCname().replace('*', '') : field.getCname();
                    var r = tmpModel.jclasses.filter(obj => obj.cname == cname);
                    if(r.length == 1){
                        r[0].fnames.push(field);
                    }else{
                        if(astBool){
                            var fnameC = ucFirst(cname);
                            var mainClass = tmpModel.jclasses.filter(obj => obj.cname == 'OlderAdult');
                            if(mainClass.length == 1){
                                mainClass[0].fnames.push({
                                    'sensorInfo': 'None',
                                         'jtype': 'List<' + cname + '>',
                                         'fname': cname.toLowerCase(),
                                        'fnameC': fnameC
                                });
                            }
                        }
                        tmpModel.jclasses.push({
                            'cname': cname,
                            'fnames': [field],
                        });
                    }
                });
            });

            console.log(tmpModel);

            // JSzip
            var zip = new JSZip();
            
            doT.templateSettings.strip = false;
            tmpModel.jclasses.forEach(function(jclass){
                var jClassTmp = doT.template(jClassTemplate);
                var result = jClassTmp({
                         'appType': tmpModel.appType,
                        'toolName': tmpModel.toolName,
                    'creationDate': tmpModel.creationDate,
                    
                           'cname': jclass.cname,
                          'fnames': jclass.fnames
                });
                result = result.replace(/<br>/gm, '\n\t');
                zip.file(jclass.cname + '.java', result);
                //console.log(result);
            });

            zip.generateAsync({type:"blob"})
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, "jModel.zip");
            });
        });
    };

    $(document).ready(function(){
        loadModel();
        
        
    });
})(jQuery);