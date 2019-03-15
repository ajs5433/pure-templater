
//same as $(document).ready(function(){})
$(function(){
    // constants
    const timezoneReplaceStr    = '<< TIME VALUES >>';
    const marketReplaceStr      = '<< MARKET >>';
    const startTimeStr          = "**Start Time:**";
    const endTimeStr            = "**End Time:**";
    const marketStr             = "**Market:**";
    const header                = 0;

    // variables
    let market                  = 'US';
    let templates               = [];
    let lastTemplateID          = 0;
    let results                 = [];
    let matchResults            = [];
    
    // cache elements
    const $links    = $('#top').find('.menu-link');
    const $main_pages = $('.main-page');
    const $page2    = $('#main-page-2');
    const $page3    = $('#main-page-3');
    const $page4    = $('#main-page-4');

        // cache page 2
    const $starttime_checkbox   = $page2.find('#start-time-check');
    const $endtime_checkbox     = $page2.find('#end-time-check');
    const $market_checkbox      = $page2.find('#market-check');
    const $startdate_input      = $page2.find('#start-date');
    const $starttime_input      = $page2.find('#start-time');
    const $enddate_input        = $page2.find('#end-date');
    const $endtime_input        = $page2.find('#end-time');
    const template_textArea     = document.getElementById('template-textarea'); 
    const template_textArea_title=document.getElementById('template-textarea-title'); 
    const template_div          = document.getElementById('template-div');
    const template_div_title    = document.getElementById('template-div-title');
    const $search               = $page2.find('#search');
    const $searchResults        = $page2.find('#search-results');
    const copyToClipboard       = document.getElementById('copy-to-clipboard');

        // cache page 3
    const $loadFile             = $page3.find('#load');
    const $download             = $page3.find('#download');
    const $templateList_div     = $page3.find('.page3-center');

        // cache page 4
    const $name_inputTxt        = $page4.find('#name');
    const $urgency_inputTxt     = $page4.find('#urgency');
    const $location_inputTxt    = $page4.find('#location');
    const $type_inputTxt        = $page4.find('#type');
    // const $marketUS_radio       = $page4.find('.market-radio-btn [value="US"]');
    // const $marketEU_radio       = $page4.find('.market-radio-btn [value="EU"]');
    const $create_btn           = $page4.find('#create-btn');
    const $discard_changes_btn  = $page4.find('#disregard-btn');
    const $temp_textArea_create = $page4.find('#template-textarea'); 
    
    // var current_page = links.getElementsByClassName('menu-link')[0].id
    var current_page = $links[0].id
    
    // setup visual content
    const pageIDs   = ['#page1','#page2','#page3','#page4','#page5'];
    const pagenames = ['Home','Active','Templates','Create','About'];
    pageIDs.forEach((id,index)=>{
        document.querySelectorAll(id).forEach(element=>{
            element.innerText = pagenames[index];
        })
    })
    
    $page2.find(".editing-item").hide();

    $search.on('keyup',(event)=>{
        $searchResults.html('')
        if(!$search.prop('value'))
            return;
        results = templates.filter(searchTemplateMatches)
        results.forEach(x=>{
            $searchResults.append(`<li><a href="#" class="list-item-search-result" id="${x[header]['ID']}"> ${x[header]['name']} ${x[header]['urgency']} ${x[header]['location']} ${x[header]['type']}</a> </li>`)
            // $searchResults.append(`<a href="#" class="list-item-search-result" id="${x[header]['ID']}" ><li > ${x[header]['name']} ${x[header]['urgency']} ${x[header]['location']} ${x[header]['type']} </li> </a>`)
        });
    })

    $searchResults.on('click','.list-item-search-result',(event)=>{
        var temp, str='', titlestr='';
        var regex1 = new RegExp(timezoneReplaceStr,"g");
        var regex3 = new RegExp(marketReplaceStr,'g');
        var regex2 = /[-_]{3,}/;

        //console.log(regex1, regex3)
        
        $search.prop('value','');
        $searchResults.html('');
        
        temp = results.filter(x=>{
            if (x[header].ID == event.target.id)
                return true;
            return false;
        })[0];
        
        titlestr = temp[header].name + ' ' +temp[header].urgency +' - '+ temp[header].location ;
        if(temp[header].type)
            titlestr += ' - '+ temp[header].type;

        //textdata starts in 1
        for (var i = 1; i<temp.length;i++){
            //console.log('key',temp[i]['key']);

            if ( regex1.test(temp[i]['key']) || regex2.test(temp[i]['key']) )
                str += '\n'+ temp[i]['key'] + '\n';
            else if(regex3.test(temp[i]['key'])){
                str += '\n'+ temp[i]['key'] + '\n';
                market = temp[i]['value'].replace(/\s/g,'');
            }
            else
                str += '\n'+ temp[i]['key'] + temp[i]['value']+ '\n';
        }
        
        str += '\n'+"__ID:__ " + temp[header].ID+'\n';

        template_textArea_title.value   = titlestr;
        template_textArea.value         = str;
        updateTextDiv();

    });

    $('.menu-link').on('click',element=>{
        var id = "#main-page-"+element.target.id.slice(4);
        $('.main-page').addClass('hidden');
        $(id).removeClass('hidden');
    })

      // page 2 Event handlers
    $page2.find('#save').on('click', function(){
        updateTextDiv();
        $page2.find(".editing-item").hide();
        $page2.find(".display-item").show();
    })

    $page2.find('#edit').on('click', function(){
        updateTextDiv();
        $page2.find(".display-item").hide();
        $page2.find(".editing-item").show();
    })
    
    $page2.find('.input-datetime').on('input',x=> updateTextDiv());
    $page2.find('.input-market').on('input',x=> updateTextDiv());
    // $page2.find('.input-datetime').on('change',x=> console.log('I changed!'));
    $page2.find('#template-textarea').on('change',x=> console.log('textarea changed'))

    $page2.find('.current-time').on('click', x=>{
        var [date, time] = getTimeNow(true);

        if(x.currentTarget.id === 'current-start-time'){
            $startdate_input.prop('value',date);
            $starttime_input.prop('value',time);
        }else if (x.currentTarget.id === 'current-end-time'){
            $enddate_input.prop('value',date);
            $endtime_input.prop('value',time);
        }
        
        updateTextDiv();
    });


    template_div.addEventListener('click',x=>{
        copyElementData(template_textArea, true);
    })
    
    template_div_title.addEventListener('click',x=>{
        copyElementData(template_textArea_title, false);
    })
      // page 3 Event handlers
      
    $page3.find('#print').on('click',()=> console.log(templates))
    
    $templateList_div.on('click','.page3-line-btn',(event)=>{
        var name    = event.target.dataset.name;
        var id      = event.target.dataset.id;
        if (name=='open')
            openTemplate(id);
        else if(name=='remove')
            removeTemplate(id);
        else 
            editTemplate(id);
    })

    $loadFile.on('click',()=>{
        // console.log('clicked!')
        $loadFile.prop('value',"");
    })
    
    $loadFile.on('change',(event)=>{
        var inputFile   = event.target.files[0];
        var fileData    = new FileReader();
        
        if(!inputFile)
            return;
        
        if (inputFile.type !== 'application/json'){
            alert('ERROR: Wrong type of file!. Data should be stored in a .json file')
            return
        }
        
        fileData.onload = (e)=>{
            templates = JSON.parse(e.target.result);
            $templateList_div.html('');
            if (templates.length>0)
                templates.forEach(updateTemplateList);
        }
        
        fileData.onerror = (e)=>{ 
            alert('there was an error loading data') 
        }
        fileData.readAsText(inputFile);
    });
    
    $download.on('click',()=>{
        var date = (new Date()).toJSON().replace(/[-/]/g,'').slice(0,8);
        downloadObjectAsJson(templates, 'data-'+date);
    });

      // page 4 Event handlers
    $page4.find('.new-template-data').on('input',()=>{
        updateNewTemplateTitle();
    })
    
    $create_btn.on('click', (event)=>{
        //event.preventDefault();
        
        if( !$name_inputTxt.prop('value') || !$urgency_inputTxt.prop('value') || !$location_inputTxt.prop('value') || !$page4.find('input:radio:checked').val())
            return;
        
        if (!$temp_textArea_create.prop('value')) {
            alert('Main text is missing, please fill out all fields');
            return;
        }
        var tempMarket = $page4.find('input:radio:checked').val();
        var newTemplate = [];
        addTitlePropsToObject(newTemplate, $name_inputTxt, $urgency_inputTxt, $location_inputTxt, $type_inputTxt);
        addTextInputToObject(newTemplate, $temp_textArea_create);

        if (addNewTemplate(newTemplate, ++lastTemplateID, tempMarket)){
            clearNewTemplateData();
            updateNewTemplateTitle();
            templates.push(newTemplate);
            alert('Template added successfully!')
        }else
            alert('There was an error adding the template')
        //console.log(newTemplate);
    })
    
    $discard_changes_btn.on('click', (event)=>{
        clearNewTemplateData();
        updateNewTemplateTitle();
        console.log('changes discarded');
    })

    $('#main-page-4').find('.market-radio-btn').on('click',x=>{
        var thisMarket = x.target.value;
        var regex = new RegExp(marketReplaceStr+'.*',"g");
        // console.log(regex)
        var val     = $temp_textArea_create.prop('value');
        var newVal  =  marketReplaceStr+" "+thisMarket;
        $temp_textArea_create.prop('value',val.replace(regex,newVal));
            
    })

    $page2.find('.page2-choose-market').on('click', x=> {
        market = x.target.dataset.market;
        updateTextDiv();
    })

    // functions
    function inputToString(message_label,date_input_element, time_input_element){
        // var input_to_date = '';
        var datestr       = '';
        // var timestr       = '';  

        var [year, month, day]  = [...(date_input_element.prop('value')).split('-')];
        var [hour, min]         = [...(time_input_element.prop('value')).split(':')];
        
        var period  = (parseInt(hour)>11)? "PM":"AM";
        hour        = (parseInt(hour) % 12);
        hour        = (hour<10)? "0"+hour : hour.toString();

        //console.log(hour,min,period)

        if(market==='US'){
            return `\n${message_label} ${month}/${day}/${year} ${hour}:${min} ${period} ET\n`
        }else{
            return `\n${message_label} ${day}/${month}/${year} ${hour}:${min} ${period} GMT\n`
        }

    }

    function getTimeNow(roundToNearest5 = false){
        // toLocaleDateString output "3/20/2019"
        // toLocaleTimeString output "08:53:20 GMT-0400 (Bolivia Time)"
        var timenow = new Date();
        var year    = timenow.getFullYear();
        var month   = timenow.getMonth();
        var day     = timenow.getDate();
        //console.log(day)
        
        month   = (month<10)?"0"+month:month ;
        day     = (day<10)?"0"+day:day ;
        
        var date = `${year}-${month}-${day}`;
        var time = timenow.toTimeString().slice(0,5);

        if (roundToNearest5){
            var minutes = timenow.getMinutes();
            minutes     = Math.round(minutes*0.2)*5;

            if (minutes == 60)
                time = time.slice(0,3) + "00";
            else if (minutes<10)
                time = time.slice(0,3) + "0" + minutes;
            else
                time = time.slice(0,3) + minutes;
        }
        
        return [date, time];
    }

    function getUpdatedTimestamp(){
        var timestamp   = '' 

        if($starttime_checkbox.prop('checked'))
            timestamp+= inputToString(startTimeStr, $startdate_input, $starttime_input);
        if($endtime_checkbox.prop('checked'))
            timestamp+= inputToString(endTimeStr, $enddate_input, $endtime_input);
        // console.log(timestamp);
        return timestamp;
    }
    
    function getUpdatedMarket(){
        //console.log($market_checkbox.prop('checked'))

        var marketReturnStr = '';
        if($market_checkbox.prop('checked'))
            marketReturnStr = marketStr+" "+market;  

        return marketReturnStr;
    }

    function updateTextDiv(){
        // update title
        template_div_title.innerHTML = '<b>'+ template_textArea_title.value + '</b>'

        // update div
        var div_datetime = getUpdatedTimestamp();
        var div_market   = getUpdatedMarket();
        
        template_div.innerHTML = template_textArea.value
        .replace(timezoneReplaceStr,div_datetime)
        .replace(marketReplaceStr,div_market)
        .replace(/\n{3,}/g,'\n\n')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
        .replace(/``(.*?)``/g,"<mark>$1</mark>")
        .replace(/(_{5,}|-{5,})/g,"<hr>")
        .replace(/[\n\r]/g,'<br>')
    }

    function updateNewTemplateTitle(){
        var name      = $name_inputTxt.prop('value');
        var urgency   = $urgency_inputTxt.prop('value');
        var locate    = $location_inputTxt.prop('value');
        var type      = $type_inputTxt.prop('value');
        
        var data = name;
        if(urgency) data = data +  " "  + urgency;
        if(locate)  data = data + " - " + locate;
        if(type)    data = data + " - " + type;
        
        $page4.find('#template-textarea-title').prop('value',data);
    }

    /*
    */ 
    
    function addTitlePropsToObject(...$args){
        var [templateArr, ...$inputs]  = [...$args];
        
        var prop       = {};
        
        $inputs.forEach(input=>{
            var key        = input.prop('id');
            var value      = input.prop('value');
            prop[key]      = value;
        });
        templateArr.push(prop);
    }
    
    /* Converts jQuery input component value into an array of objects (properties)
        new lines should contain two data sets: they object key and value
          key   : Taken from the text that is surrounded by ** key ** or __ key __
          value : The rest of the data
    */
    function addTextInputToObject(templateArr, $input){
        var regex1  = /\*{2}.*\*{2}/g;
        var regex2  = /_{2}.*_{2}/g;
        var regex3  = /[-_]{3,}/g;
        var regex4  = new RegExp(timezoneReplaceStr,"g");
        var regex5  = new RegExp(marketReplaceStr,"g");

        var str     = $input.prop('value');
        var lines   = str.replace(/[\n\r]{2,}/g,'\n').split('\n');
      
        lines.forEach((line,index)=>{
            var key,value;
            var prop = {}

            if(!line)
                return;
            else if(regex1.test(line))
                key = line.match(regex1)[0];
            else if(regex2.test(line))
                key = line.match(regex2)[0];
            else if(regex3.test(line))
                key = line.match(regex3)[0];
            else if(regex4.test(line))
                key = timezoneReplaceStr;
            else if(regex5.test(line))
                key = marketReplaceStr;
            else{
                alert(`A specific attribute was not included in the template. Problem in line ${index}:\n\n${line}`);
                console.log(`Please make sure every line one of the following formats:
                ** key ** value
                `` key `` value`);
                return null;
            }
            //console.log('line is'+line+'here');

            prop['key']             = key;
            prop['value']           = line.slice(key.length);
            templateArr.push(prop) ;
        });
      
    }

    function clearNewTemplateData(){
        $name_inputTxt.prop('value','');
        $urgency_inputTxt.prop('value','');
        $location_inputTxt.prop('value','');
        $type_inputTxt.prop('value','');
        $temp_textArea_create.prop('value','');

        $temp_textArea_create.prop('value', '\n'+timezoneReplaceStr+'\n\n'+marketReplaceStr+'\n');
    }

    function addNewTemplate(template, ID, tempMarket){
        // creating a string of the most important information
        // of the current object to then create a hash
        var hash, match = [];
 
        var tempBasicInfo   =   template[header]['urgency']+ 
                                template[header]['location']+ 
                                template[header]['type']+
                                tempMarket+
                                template.length;

        template[header]["ID"]  = ID;

        for (var propertyID =1; propertyID < template.length ; propertyID++){
            tempBasicInfo += template[propertyID]['value'].length;
        }

        // check if there are already templates with that hash
        // if so, check if all properties match.
        template[header]['hash'] = createHash(tempBasicInfo);

        templates.filter(temp => (temp[0]['hash'] == template[0]['hash']))
        .forEach(temp=>{
            for(var i = 1; i< temp; i++){
                if(temp[i].value != template[i].value)
                    return;
            }
            //match.push(temp);
            match.push(temp[0].ID);
        })

        if (match.length){
            // console.log('Template IDs that match the current template: ',match);      
            var proceed = confirm("There's already a template that has the same information, Do you still want to add this template?");
            if (!proceed)
                return false;
        }
        return true;
    }

    function createHash(str){
        var hashcode = 0;
        for (i=0;i<str.length;i++){
            // 31 * i == (i << 5) - i
            hashcode = ((hashcode << 5) - hashcode ) + str.charCodeAt(i);
        }
        return hashcode
      }

    function searchTemplateMatches(object){
        var searchInTitle = true;
        var searchKeys = $search.prop('value').split(' ');
        var minMatch   = Math.floor(searchKeys.length/2) || 1 ;

        //console.log('search keys',searchKeys)
        //console.log('min match', minMatch);

        var count =0;
        var regex;
        for(var i =0; i<searchKeys.length;i++){
            regex = new RegExp(searchKeys[i],"i")
            for(var j=1; j<object.length;j++){
                if(regex.test(object[j]['value'])){
                    count++;
                    break;
                }
            }
        }

        if(searchInTitle){
            var values = Object.values(object[header]);
            for(var i =0; i<searchKeys.length;i++){
                regex = new RegExp(searchKeys[i],"i");
                if(regex.test(values)){
                    count++;
                    break;
                }
            }
        }

        if (count>=minMatch)
            return true;
        return false;
    }

    function updateTemplateList(template){
                                                                                                      
        var tempIdStr; 
        var tempId          =   template[header].ID;
        var tempTitle       =   template[header]['name']        + ' ' +
                                template[header]['urgency']     + ' - ' +
                                template[header]['location'];
                                
        if (template[header]['type'])
            tempTitle+=' - '+template[header]['type'];
        tempTitle += '  ('+template[header][marketReplaceStr]+')';

        switch(template[header].ID.toString.length){
            case 1: tempIdStr = "    " + tempId; break;
            case 2: tempIdStr = "   "  + tempId; break;
            case 3: tempIdStr = "  "   + tempId; break;
            case 4: tempIdStr = " "    + tempId; break;
            default: tempIdStr = tempId; break;
        }

        var templateHTML =  '<div id="page3-line">'                                                                                                                                             +
                                '<div>'                                                                                                                                                         +
                                    '<span id="page3-ID">'+tempIdStr+' </span> <span>'+tempTitle+'</span>'                                                                                      +
                                '</div>'                                                                                                                                                        +
                                '<div>'                                                                                                                                                         +
                                    '<button class="page3-line-btn" title="open"   data-id="'+tempId+'"><i data-name="open"   data-id="'+tempId+'"class="far fa-folder-open" ></i></button>'    + 
                                    '<button class="page3-line-btn" title="edit"   data-id="'+tempId+'"><i data-name="edit"   data-id="'+tempId+'"class="far fa-edit"        ></i></button>'    + 
                                    '<button class="page3-line-btn" title="remove" data-id="'+tempId+'"><i data-name="remove" data-id="'+tempId+'"class="far fa-window-close"></i></button>'    +
                                '</div>'                                                                                                                                                        +
                            '</div>'  
        $templateList_div.append(templateHTML);
        
    }

    // This function was obtained from:
    // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    function downloadObjectAsJson(exportObj, exportName){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function copyElementData(element, needsConversion){
        var copy = ''

        // update copy element
        if(needsConversion){
            var div_datetime = getUpdatedTimestamp();
            var div_market   = getUpdatedMarket();
            
            copy = element.value
            .replace(timezoneReplaceStr,div_datetime)
            .replace(marketReplaceStr,div_market)
            .replace(/\n{3,}/g,'\n\n')
            .replace(/``(.*)``.*/g,'')
        }else
            copy = element.value;
       
        navigator.clipboard.writeText(copy).then(function() {
          /* clipboard successfully set */
        }, function() {
          /* clipboard write failed */
        });
    }
    

    function openTemplate(id){
        console.log('Opening '+id);
        var temp, str='', titlestr='';
        var regex1 = new RegExp(timezoneReplaceStr,"g");
        var regex3 = new RegExp(marketReplaceStr,'g');
        var regex2 = /[-_]{3,}/;

        temp = templates.filter(x=>{
            if (x[header].ID == id)
                return true;
            return false;
        })[0];
        
        document.getElementById('page2').click();

        titlestr = temp[header].name + ' ' +temp[header].urgency +' - '+ temp[header].location ;
        if(temp[header].type)
            titlestr += ' - '+ temp[header].type;

        for (var i = 1; i<temp.length;i++){
            if ( regex1.test(temp[i]['key']) || regex2.test(temp[i]['key']) )
                str += '\n'+ temp[i]['key'] + '\n';
            else if(regex3.test(temp[i]['key'])){
                str += '\n'+ temp[i]['key'] + '\n';
                market = temp[i]['value'].replace(/\s/g,'');
            }
            else
                str += '\n'+ temp[i]['key'] + temp[i]['value']+ '\n';
        }
        
        str += '\n'+"__ID:__ " + temp[header].ID+'\n';
        console.log(titlestr,str)
        template_textArea_title.value   = titlestr;
        template_textArea.value         = str;
        updateTextDiv();
    }

    function removeTemplate(id){
        $templateList_div.html('');
        console.log('Removing '+id);
        var newTemplates = [];
        for(var i =0; i<templates.length;i++){
            if(templates[i][header].ID == id)
                continue;
            newTemplates.push(templates[i]);
        }

        templates = newTemplates;
        templates.forEach(updateTemplateList);
    }

    function editTemplate(id){
        console.log('Editing '+id);
        // document.getElementById('page6').click();
    }
        
    template_textArea.value = '\n'+timezoneReplaceStr+'\n\n'+marketReplaceStr+'\n';
    
    updateTextDiv();
    clearNewTemplateData();
    // for development
    document.getElementById('page4').click();

})
