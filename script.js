
//same as $(document).ready(function(){})
$(function(){
    // constants
    const timezone_replace_str  = '<<TIME VALUES GO HERE DO NOT DELETE>>';

    // variables
    let market                  = 'US';
    let templates               = [];
    
    // cache elements
    const links     = $('#top').find('.menu-link');
    const $page2    = $('#main-page-2');
    const $page4    = $('#main-page-4');

        // cache page 2
    const $starttime_checkbox   = $page2.find('#start-time-check');
    const $endtime_checkbox     = $page2.find('#end-time-check');
    const $startdate_input      = $page2.find('#start-date');
    const $starttime_input      = $page2.find('#start-time');
    const $enddate_input        = $page2.find('#end-date');
    const $endtime_input        = $page2.find('#end-time');
    const template_textArea     = document.getElementById('template-textarea'); 
    const template_div          = document.getElementById('template-div');

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

      // page 4 Event handlers
    $page4.find('.new-template-data').on('input',()=>{
        updateNewTemplateTitle();
    })
    
    $create_btn.on('click', (event)=>{
        //event.preventDefault();
        
        if( !$name_inputTxt.prop('value')    ||  !$urgency_inputTxt.prop('value') ||
            !$location_inputTxt.prop('value')||  !$type_inputTxt.prop('value') )
              return;
        
        if (!$temp_textArea_create.prop('value')) {
            alert('Main text is missing, please fill out all fields');
            return;
        }
        
        var newObject = inputsToObject($name_inputTxt, $urgency_inputTxt, $location_inputTxt, $type_inputTxt, $temp_textArea_create);
    })
    
    $discard_changes_btn.on('click', (event)=>{
      $name_inputTxt.prop('value','');
      $urgency_inputTxt.prop('value','');
      $location_inputTxt.prop('value','');
      $type_inputTxt.prop('value','');
      $temp_textArea_create.prop('value','');
      
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

        console.log(hour,min,period)

        if(market==='US'){
            return `\n${month}/${day}/${year} ${hour}:${min} ${period} ET\n`
        }else{
            return `\n${day}/${month}/${year} ${hour}:${min} ${period} GMT\n`
        }

        // input_to_date = `\n${message_label} ${datestr} ${timestr}\n`;
        // return input_to_date;
        return `\n${message_label} ${datestr} ${timestr}\n`
    }

    function getTimeNow(roundToNearest5 = false){
        // toLocaleDateString output "3/20/2019"
        // toLocaleTimeString output "08:53:20 GMT-0400 (Bolivia Time)"
        var timenow = new Date();
        var year    = timenow.getFullYear();
        var month   = timenow.getMonth();
        var day     = timenow.getDate();
        console.log(day)
        
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
            timestamp+= inputToString('**Start Time:**', $startdate_input, $starttime_input);
        if($endtime_checkbox.prop('checked'))
            timestamp+= inputToString('**End Time:**', $enddate_input, $endtime_input);
        // console.log(timestamp);
        return timestamp;
    }

    function updateTextDiv(){
        console.log('updating div');
        var div_datetime = getUpdatedTimestamp();
        
        template_div.innerHTML = template_textArea.value
        .replace(timezone_replace_str,div_datetime)
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

    /* Converts jQuery input component value into an object
        new lines should contain two data sets: they object key and value
          key   : Taken from the text that is surrounded by ** key ** or __ key __
          value : The rest of the data
    */
    function inputsToObject(...$inputs){
      var object = {};
      var regex1  = /\*{2}.*\*{2}/g;
      var regex2  = /_{2}.*_{2}/g;
      
      $inputs.forEach(input=>{
        var str     = input.prop('value');
        var lines   = str.replace(/[\n\r]{2,}/g,'\n').split('\n');
        
        console.log('---------------')
        lines.forEach((line,index)=>{
        
        if(!regex1.test(str) || !regex2.test(str)){
          alert(`We were unable to add template. there was a problem in line:\n\n${line}`);
          console.log(
          `Please make sure every line one of the following formats:
              ** key ** value
              __ key __ value`);
            return null;
          }
                        
          var key   = str.match(regex1)[0] || str.match(regex2)[0];
          var value = str.slice(key.length);
        
          console.log(key,value)
          })
        });
      
    }
    
    template_textArea.value = timezone_replace_str;
    updateTextDiv();

    // for development
    document.getElementById('page4').click();

})
