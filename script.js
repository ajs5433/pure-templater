
//same as $(document).ready(function(){})
$(function(){
    // constants
    const timezoneReplaceStr    = '<<TIME VALUES GO HERE DO NOT DELETE>>';
    const startTimeStr          = "**Start Time:**";
    const endTimeStr            = "**End Time:**";
    const header                = 0;

    // variables
    let market                  = 'US';
    let templates               = [];
    let lastTemplateID          = 0;
    let results                 = [];
    // let matchArr                = [];
    
    // cache elements
    const links     = $('#top').find('.menu-link');
    const $page2    = $('#main-page-2');
    const $page3    = $('#main-page-3');
    const $page4    = $('#main-page-4');

        // cache page 2
    const $starttime_checkbox   = $page2.find('#start-time-check');
    const $endtime_checkbox     = $page2.find('#end-time-check');
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

        // cache page 3
    const $loadFile             = $page3.find('#load');
    const $download             = $page3.find('#download');

        // cache page 4
    const $name_inputTxt        = $page4.find('#name');
    const $urgency_inputTxt     = $page4.find('#urgency');
    const $location_inputTxt    = $page4.find('#location');
    const $type_inputTxt        = $page4.find('#type');
    const $create_btn           = $page4.find('#create-btn');
    const $discard_changes_btn  = $page4.find('#disregard-btn');
    const $temp_textArea_create = $page4.find('#template-textarea'); 
    
    // var current_page = links.getElementsByClassName('menu-link')[0].id
    var current_page = links[0].id
    
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
            $searchResults.append(`<li><a href="#" class="list-item-search-result" id="${x[header]['ID']}"> <em> ${x[header]['name']} ${x[header]['urgency']} ${x[header]['location']} ${x[header]['type']}</em> </a> </li>`)
        });
    })

    $searchResults.on('click','.list-item-search-result',(event)=>{
        var temp, str='', titlestr='';
        var regex1 = new RegExp(timezoneReplaceStr);
        var regex2 = /[-_]{3,}/;
        
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
            if ( regex1.test(temp[i])|| regex2.test(temp[i]) )
            str += '\n'+ temp[i]['key'] + '\n';
            else
            str += '\n'+ temp[i]['key'] + temp[i]['value']+ '\n';
        }
        
        template_textArea_title.value   = titlestr;
        template_textArea.value         = str;
        updateTextDiv();

    });

    // setup elements, event handlers
    $('.menu-link').each((index, element) => {
        let elementID    = element.id;
        window.addEventListener('resize',(event)=>{
            links.filter((idx,elem)=>{elem.id===current_page}).click();
            // links.getElementById(current_page).click();
        })        
    });
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

      // page 2 Event handlers
      
    $page3.find('#print').on('click',()=> console.log(templates))
      
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
            //console.log(templates);
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
        
        if( !$name_inputTxt.prop('value') || !$urgency_inputTxt.prop('value') || !$location_inputTxt.prop('value') )
            return;
        
        if (!$temp_textArea_create.prop('value')) {
            alert('Main text is missing, please fill out all fields');
            return;
        }
        
        var newTemplate = [];
        addTitlePropsToObject(newTemplate, $name_inputTxt, $urgency_inputTxt, $location_inputTxt, $type_inputTxt);
        addTextInputToObject(newTemplate, $temp_textArea_create);

        if (addNewTemplate(newTemplate, ++lastTemplateID)){
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

    function updateTextDiv(){
        // update title
        template_div_title.innerHTML = '<b>'+ template_textArea_title.value + '</b>'

        // update div
        var div_datetime = getUpdatedTimestamp();
        
        template_div.innerHTML = template_textArea.value
        .replace(timezoneReplaceStr,div_datetime)
        .replace(/\n{3,}/g,'\n\n')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
        .replace(/__(.*?)__/g,"<mark>$1</mark>")
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
            else{
                alert(`A specific attribute was not included in the template. Problem in line ${index}:\n\n${line}`);
                console.log(`Please make sure every line one of the following formats:
                ** key ** value
                __ key __ value`);
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

        $temp_textArea_create.prop('value', '\n'+timezoneReplaceStr+'\n');
    }

    function addNewTemplate(template, ID){
        // creating a string of the most important information
        // of the current object to then create a hash
        var hash, match = [];
        var tempBasicInfo   =   template[header]['urgency']+ 
                                template[header]['location']+ 
                                template[header]['type']+
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

        var searchKeys = $search.prop('value').split(' ');
        var minMatch   = Math.floor(searchKeys.length/2) || 1 ;

        //console.log('search keys',searchKeys)
        //console.log('min match', minMatch);

        var count   = 0;
        var id      = object[header].ID;
        var regex;
        for(var i =0; i<searchKeys.length;i++){
            regex = new RegExp(searchKeys[i],"i")
            for(var j=1; j<object.length;j++){
                if(regex.test(object[j]['value'])){
                    count++;
                    // matchArr[id] = object[j]['value'].match(regex);
                    // console.log(i,j,object[j]['value'])
                    // console.log('match',object[j]['value'],'for object', object)
                    break;
                }
            }
        }
        if (count>=minMatch)
            return true;
        return false;
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









    
    template_textArea.value = '\n'+timezoneReplaceStr+'\n';
    
    updateTextDiv();
    clearNewTemplateData();
    // for development
    document.getElementById('page2').click();

})
