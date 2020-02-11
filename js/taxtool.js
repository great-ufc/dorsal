(function ($) {
    "use strict";
    var taxtool = null;

    function loadModel(){
        $.get(getDataSource(), function(data) {
            taxtool = new TaxTool(data);
            appsTypeSelect(taxtool.getAppsType());
            fillTheCards(taxtool);
            applySubmitEvent();
            applyCheckAndUncheckEvents();
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

            if($("#applicationTypeSelect").val() != 'Null' && 
                $("#targetProgLangSelect").val() != 'Null' &&
                selectedCategories.length > 0){
                // Generate the code
                alert('Calma garoto... I\' working on it!');
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

    $(document).ready(function(){
        loadModel();        
    });
})(jQuery);