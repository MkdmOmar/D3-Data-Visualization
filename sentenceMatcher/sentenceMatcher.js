function sentenceMatch(entities, transcript) {
    if (!entities) {
        alert("No entities");
        console.log("No entities");
        return null;
    }


    try {
        entities = JSON.parse(JSON.parse(entities).entities);

    } catch (e) {
        console.log(e);
        alert(e);
        return;
    }

    var numEntities = entities.length;

    var sentences = transcript.split('\n');
    var numSentences = sentences.length;

    var timeStartConference = sentences[0].substring(1, sentences[0].indexOf('>'));

    for (var i = 0; i < numSentences; i++) {
        var fullSentence = sentences[i];
        var timestampBegin = 0;
        var timestampEnd = fullSentence.indexOf('>');

        var timestamp = fullSentence.substring(timestampBegin + 1, timestampEnd);

        var sentenceText = fullSentence.substring(timestampEnd + 1, fullSentence.length);

        for (var j = 0; j < numEntities; j++) {

            //If current entity exists in current sentence
            if (sentenceText.indexOf(entities[j].text) !== -1) {

                //Check if entities array does not have a Sentences field
                if (!entities[j]['Sentences']) {
                    entities[j]['Sentences'] = [];
                }

                //Insert Sentence Text and Seconds Elapsed
                var tmpObj = {};
                tmpObj['Sentence Text'] = sentenceText;
                tmpObj['Seconds Elapsed'] = Math.floor((timestamp - timeStartConference) / 1000);

                entities[j]['Sentences'].push(tmpObj);

            }
        }

    }

    console.log(JSON.stringify(entities, null, "\t"));
    return entities;

}

function addSentences() {

    //Hide submit button and show reset button
    document.getElementById("submit").style.display = 'none';
    document.getElementById("h3").style.display = 'none';
    document.getElementById("sampleEntitiesDiv").style.display = 'none';

    document.getElementById("reset").style.display = 'block';


    var inputEntities = document.getElementById('inputEntities').value;
    var transcriptText = getTranscript();
    var updatedEntities = sentenceMatch(inputEntities, transcriptText);

    document.getElementById('inputEntities').value = JSON.stringify(updatedEntities, null, "\t");


}


function reset() {

    //Reset formInput and hide reset button
    document.getElementById('inputEntities').value = "";
    document.getElementById("reset").style.display = 'none';
    document.getElementById("submit").style.display = 'block';
    document.getElementById("h3").style.display = 'block';
    document.getElementById("sampleEntitiesDiv").style.display = 'block';
    document.getElementById("sampleEntities").checked = false;
}


function getSampleEntities() {
    var input = {
        "conference-uuid": "B9500A25-B2F6-4379-B022-FA486ADC7262",
        "entities": "[{\"type\":\"JobTitle\",\"text\":\"president\",\"relevance\":\"0.979539\",\"count\":\"2\",\"Relevance\":\"0.979539\"},{\"type\":\"FieldTerminology\",\"text\":\"unified communications\",\"relevance\":\"0.911581\",\"count\":\"1\",\"Relevance\":\"0.911581\"},{\"type\":\"JobTitle\",\"text\":\"chief operating officer\",\"relevance\":\"0.910919\",\"count\":\"1\",\"Relevance\":\"0.910919\"},{\"type\":\"JobTitle\",\"text\":\"vice president\",\"relevance\":\"0.892146\",\"count\":\"1\",\"Relevance\":\"0.892146\"},{\"type\":\"JobTitle\",\"text\":\"chief executive officer\",\"relevance\":\"0.878394\",\"count\":\"1\",\"Relevance\":\"0.878394\"},{\"type\":\"Person\",\"text\":\"Alan maverick\",\"relevance\":\"0.839485\",\"count\":\"1\",\"Relevance\":\"0.839485\"},{\"type\":\"Person\",\"text\":\"Katherine\",\"relevance\":\"0.838896\",\"count\":\"1\",\"Relevance\":\"0.838896\"},{\"type\":\"Person\",\"text\":\"Clark Peterson\",\"relevance\":\"0.831748\",\"count\":\"1\",\"Relevance\":\"0.831748\"},{\"type\":\"Person\",\"text\":\"Joe\",\"relevance\":\"0.810659\",\"count\":\"1\",\"Relevance\":\"0.810659\"},{\"type\":\"JobTitle\",\"text\":\"CFO\",\"relevance\":\"0.796784\",\"count\":\"1\",\"Relevance\":\"0.796784\"},{\"type\":\"Company\",\"text\":\"NPR\",\"relevance\":\"0.775296\",\"count\":\"1\",\"Relevance\":\"0.775296\"},{\"type\":\"Person\",\"text\":\"Tony\",\"relevance\":\"0.760575\",\"count\":\"1\",\"Relevance\":\"0.760575\"},{\"type\":\"Country\",\"text\":\"Mexico\",\"relevance\":\"0.758649\",\"count\":\"1\",\"Relevance\":\"0.758649\"},{\"type\":\"JobTitle\",\"text\":\"CIO\",\"relevance\":\"0.758402\",\"count\":\"1\",\"Relevance\":\"0.758402\"},{\"type\":\"FieldTerminology\",\"text\":\"voice network\",\"relevance\":\"0.740985\",\"count\":\"1\",\"Relevance\":\"0.740985\"},{\"type\":\"Quantity\",\"text\":\"six hundred million dollars\",\"relevance\":\"0.740985\",\"count\":\"1\",\"Relevance\":\"0.740985\"},{\"type\":\"Quantity\",\"text\":\"sixty percent\",\"relevance\":\"0.740985\",\"count\":\"1\",\"Relevance\":\"0.740985\"}]"
    };

    return input;
}

//Insert sample JSON input
function insertSampleEntities() {

    if (document.getElementById("sampleEntities").checked == true) {

        document.getElementById('inputEntities').value = JSON.stringify(getSampleEntities(), null, "\t");
    } else {
        document.getElementById('inputEntities').value = "";
    }
}
