var cardTemplate = '<div class="col-lg-2" style="padding: 0px 5px;"><div class="card" style="height: 180px;">';
    cardTemplate += '<div class="card-body text-center" style="padding-top: 15px; padding-bottom: 15px;">';
    cardTemplate += '<h5 class="card-title my-card-title">{{=it.cardTitle}}</h5>';
    cardTemplate += '<p class="card-text my-card-body">{{=it.cardContent}}</p>';
    cardTemplate += '<input value="{{=it.cardID}}" class="my-toggle selectCategory" type="checkbox" data-toggle="toggle" data-on="Included" data-off="Not Included" data-onstyle="success" data-offstyle="danger" data-height="10">';
    cardTemplate += '</div></div></div>';

function createCard(id, title, content){
    var cardTmp = doT.template(cardTemplate);
    var result = cardTmp({
        cardID: id,
        cardTitle: title,
        cardContent: content,
    });
    return result;
}