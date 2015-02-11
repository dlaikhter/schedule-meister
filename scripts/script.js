var graphWidth = 1100;
var graphHeight = 560;
var hourStart = "8:00am"
var hourEnd = "10:00pm"
var timeMin = timeStringToTime(hourStart);
var timeMax = timeStringToTime(hourEnd);
var queryResults = [];

$(document).ready(
function(){
    var canvas = document.getElementById("schedule");
    var clickeable = true;

    $("#ui2").hide();
    $(".time_entry").hide(); 
    $(".day_choice")
    .click(function(){
        if(!$(this).hasClass('selected_day_choice')){
            $(".selected_day_choice").removeClass('selected_day_choice');
            $(this).addClass('selected_day_choice');
            if($(this).attr('id') == 'same_time'){
                $("#time_div").stop().slideDown();
		        $(".time_entry").stop().slideUp();
	            clickeable = true;
        }else{
                $("#time_div").stop().slideUp();
	    }
    }});

    $("#save_schedule_image")
    .click(function(){
        params = { imgdata : canvas.toDataURL('image/jpeg') };
        $.post('/save', params, function (data) { /* ... */ }) 
    });
    
    $("#query_button")
    .click(function(){
        queryClasses();    
    });
     
    $("#add_class")
    .click(function(){
        if(clickeable){
            setScheduleItem();
        }
    });
    
    $(".class_button")
    .mousedown(function(){
        $(this).css('background-color', '#ab38e0').css('border-color', '#aa34d9')
    })
    .mouseup(function(){
        $(this).css('background-color', '#ed2bff').css('border-color', '#ca35e8')
        
    })
    .mouseout(function(){
        $(this).css('background-color', '#ed2bff').css('border-color', '#ca35e8')
    });
     
    $('.color_picker')
    .colpick({
        layout:'hex',
        submit:0,
        onChange:function(hsb,hex,rgb,el,bySetColor) {
            $(el).css('background-color','#'+hex);
            if(!bySetColor) $(el).val(hex);
    }})
    .css('background-color', '#3289c7');
	
    $(".day")
    .click(function(){
	var timeEntry = $(this).find(".time_entry")
	if($("#different_times").hasClass('selected_day_choice') && timeEntry.css('display') == 'none'){
	    $(this).addClass('selected_day');
	    $(this).addClass('open_time_entry');
	    timeEntry.show();
        clickeable = false;
	}
        else if($("#same_time").hasClass('selected_day_choice') && $(this).hasClass("selected_day")){
	    $(this).removeClass('selected_day');
	}
	else{
	    $(this).addClass('selected_day');
	}
    });
    
    $("#close_results").click(function(){
        $("#results_container").hide();
        $("body").css("overflow","auto");
    });

    $("#close_popup").click(function(){
        clearPopUpBox();
        $("#popup_box").hide();
    });
    
    $(".remove_day")
    .click(function(e){
	$(this).parent().parent().removeClass('selected_day');
	$(this).parent().parent().removeClass('open_time_entry');
	$(this).parent().hide();
	e.stopPropagation();
    clickeable = true;
    });

    $(document)
    .mouseup(function(e){
	if($(e.target).attr('class') != 'time_entry' && $(e.target).parent().attr('class') != 'time_entry'){
	    $(".time_entry").hide().parent().removeClass('open_time_entry');
        clickeable = true;
    }});
   

    $(".button")
    .mouseover(function(){
        if(!$(this).attr('selected')){
            $(this).css('background-color', "#EBABDE");   
    }})
    .mouseout(function(){
        if(!$(this).attr('selected')){
            $(this).css('background-color', "#F089DB");   
    }});
                
    $(".button").click(function(){
	if(!$(this).attr('selected')){
	    $("[class=button][selected]")
            .css("background-color", "#F089DB")
            .removeAttr("selected");
            $(this)
            .css("background-color","#B363B8")
            .attr('selected', 'selected');
            if($(this).attr('id') == 'button1'){
                $("#ui1").show();
                $("#ui2").hide();
            }
            else{
                $("#ui2").show();
                $("#ui1").hide();
            }
        }
    });
     
    $("#results").on('mousedown', '.result', function(){
        if(!$(this).hasClass("selected_result")){
            $(".selected_result").removeClass("selected_result");
            $(this).addClass("selected_result");
            setResultInfo($(this).attr("result_id"));
        }
    });
    
    $("#add_query_class").click(function(){
        index = parseInt($(".selected_result").attr("result_id"));
        addQueryClass(queryResults[index]);
        $("body").css("overflow","auto");
        $("#results_container").hide();
    });
    
    checkLocalStorage();
    clearCanvas();	
    drawCanvas();
    getClasses();
    canvas.onclick = function(e){clickClass(e, canvas)}
    addTerms();
});

function addTerms(){
    $.ajax({url:"/term/",
		type:'GET',
		success: function(data){
		    var terms = JSON.parse(data);
            var term;
            for(var i in terms){
                term  = terms[i];
                $("#term_select").append($('<option></option>').val(term['val']).html(term['term']));
            }
        }});
}

function drawCanvas(){
    var canvas = document.getElementById("schedule");
    var context = canvas.getContext("2d");
    var daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    var times = ["8:00am", "9:00am", "10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm", "6:00pm", "7:00pm", "8:00pm", "9:00pm", "10:00pm"]

    for(var i = 0; i < 7; i++){
        context.beginPath();
        context.lineWidth="4";
        context.strokeStyle="black";
        context.rect(95*2 + (i*(graphWidth/7)*2), 45*2, graphWidth/7*2, graphHeight*2);
        context.stroke();
    }

    for(var i in daysOfWeek){
        context.fillStyle = "black";
        context.font = "40px Arial";
        context.textAlign = 'left';
        context.fillText(daysOfWeek[i], 130*2+(i*(graphWidth/7))*2, 35*2)
    }
	
    for(var i in times){
	context.fillStyle = "black";
	context.font = "30px Arial";
        context.textAlign = 'left';
        context.fillText(times[i], 0, 100 + ((graphHeight+40)*2)/times.length*i)
    }
}

function clearCanvas(){
    var canvas = document.getElementById("schedule");
    var context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClasses(){
    var canvas = document.getElementById("schedule");
    var context = canvas.getContext("2d");
    var uniClass;
    var height;
    classes = JSON.parse(localStorage.getItem('classes'));
    clearCanvas();
    
    for(key in classes){
        var textWidth;
        var textHeight;
        var text;
        var time;

        uniClass = classes[key];
	for(timeKey in uniClass.classTimes){
            day = uniClass.classTimes[timeKey]
            context.fillStyle = uniClass.color;
            x = 95*2 + ((getDayNum(timeKey))*(graphWidth/7)*2);
            y = 45*2 + (((day['startTime'] - timeMin)/(timeMax - timeMin))*graphHeight*2);
            width = graphWidth/7*2;
            height = (((day['endTime'] - day['startTime'])/(timeMax - timeMin))*graphHeight*2);
            context.fillRect(x + 2,y + 2, width - 4, height + 2);
            context.fillStyle = "black";
	    context.font = "25px Arial";
	    context.textAlign = 'center';
	    text = uniClass.name;
            textWidth = context.measureText(text).width;
            while(textWidth > 275){
                text = text.slice(0,text.length-1);
                textWidth = context.measureText(text).width;
                if(textWidth <= 275){
                    text = text.concat("...")
                }
            }
            context.fillText(text, x + (width/2), y+22+(height/4));

            if(height >= 75){
                time = day.start+"-"+day.end;
                context.fillText(time, x + (width/2), y+30+(height/2));
            }
        }
    }
    drawCanvas();
}

function clickClass(e, canvas){
    var x;
    var y;
    var width;
    var height;
    var max_x;
    var max_y;
    var mouse_x;
    var mouse_y;
    var uniClass;
    var day;
    var rect = canvas.getBoundingClientRect();
    
    classes = JSON.parse(localStorage['classes'])

    mouse_x = (e.clientX - rect.left)*2;
    mouse_y = (e.clientY - rect.top)*2;

    for(classKey in classes){
        uniClass = classes[classKey];
        for(timeKey in uniClass.classTimes){
            day = uniClass.classTimes[timeKey];
            x = 95*2 + ((getDayNum(timeKey))*(graphWidth/7)*2) + 2;
            y = 45*2 + (((day['startTime'] - timeMin)/(timeMax - timeMin))*graphHeight*2) + 2;
            width = graphWidth/7*2 - 4;
            height = (((day['endTime'] - day['startTime'])/(timeMax - timeMin))*graphHeight*2) + 2;
            max_x = x + width;
            max_y = y + height;

            if(mouse_x >= x && mouse_x <= max_x && mouse_y >= y && mouse_y >= y && mouse_y <= max_y){
                openPopUpBox(uniClass);
                break;
            }
        }
    }
}

function openPopUpBox(uniClass){
    $('#popup_box').show();
    $('#popup_header').html(uniClass.name);
    if('crn' in uniClass){
        $('#popup_crn').html(uniClass.crn);
    }
    if('instructor' in uniClass){
        $('#popup_instructor').html(uniClass.instructor);
    }
    if('type' in uniClass){
        $('#popup_type').html(uniClass.type);
    }
    if('sec' in uniClass){
        $('#popup_sec').html(uniClass.sec);
    }
    if('subjCode' in uniClass){
        $('#popup_subj').html(uniClass.subjCode);
    }
    if('courseNo' in uniClass){
        $('#popup_code').html(uniClass.courseNo);
    }

    var classTimes = convertTimesToString(uniClass.classTimes);
    
    if(classTimes.length === 0){
        $(".popup_date:eq(0)").text("TBD");
    }       
    else{   
        var timeItem;
    
        for(var i in classTimes){
            timeItem = classTimes[i];
            $(".popup_date:eq("+i.toString()+")").text(timeItem[0]);
            $(".popup_time:eq("+i.toString()+")").text(timeItem[1]);
        }
    }

}

function clearPopUpBox(){
    $('popup_header').html('');
    $('popup_info').html('');
    $('popup_date').html('');
    $('popup_time').html('');
    for(var i = 0; i < 5; i++){
        $(".popup_date"+i.toString()).text('');
        $(".popup_time"+i.toString()).text('');
    }   
}

function getDayNum(day){
    weekArray = ["M", "T", "W", "R", "F", "S", "SU"];
    return weekArray.indexOf(day);       
}

function queryClasses(){
	var request = createRequest();
    var count = 0;
    queryResults = []; 
    $(".result").remove();

    for(var i in request){
        if(request[i] == ""){
            count += 1;
        }
    }
    if(count < 3){
        $("#error_box").text("");
        $("#loading").fadeToggle();
        $("#load_text").fadeToggle();
        $.ajax({url:"/get_class/",
            type:'POST',
            data:request, 
            timeout:10000,
            error: function(){
                $("#loading").fadeToggle();
                $("#load_text").fadeToggle();
                $("#errorBox").text("request timed out");
            },
            success: function(data){
                $("#loading").fadeToggle();
                $("#load_text").fadeToggle();
                clearResultInfo(); 
                $("#results_container").show();
                $("body").css('overflow', 'hidden');
                var classDict = JSON.parse(data);
               
                queryResults = dictToUnivClass(classDict);
                addToResults(queryResults); 
        }});
    }
    else{
	    $("#error_box").text("you have to enter something!");
    }
}

function createRequest(){
    var request = {};
    var method = $("input[name='query']:checked").val();
   
    request["term"] = $("#term_select").val();
    request["crn"] = $("#crn_input").val();
    request["crs_num"] = $("#cls_number").val();
    request["title"] = $("#crs_name").val();

    return request;
}

function addToResults(list){
    var result;
    var html;
    var element;
    var classTemplate = ['<div result_id="%id" class="result %fit">',
                         '<div class="result_item" style="width:7%">%subj</div>',
                         '<div class="result_item" style="width:7%">%code</div>',
                         '<div class="result_item" style="width:40%">%name</div>',
                         '<div class="result_item" style="width:7%">%sec</div>',
                         '<div class="result_item" style="width:18%">%type</div>',
                         '<div class="result_item" style="width:21%; border-right-style:none">%cap</div>',
                         '</div>'].join("");
    
    for(var i in list){
        result = list[i];
        html = classTemplate;
        var re = new RegExp("%fit", 'g');
        if(classOverlap(result) !== ""){
            html = html.replace(re, "not_fit");
        }
        else{
            html = html.replace(re, "fit");
        }
        html = html.replace("%id", i);
        html = html.replace("%subj", result.subjCode);
        html = html.replace("%code", result.courseNo);
        html = html.replace("%name", result.name);
        html = html.replace("%sec", result.sec);
        html = html.replace("%type", result.type);
        html = html.replace("%cap", result.stat);
        element = $.parseHTML(html);
        $("#results").append(element);
    }
}

function dictToUnivClass(classDict){
    var dict;
    var uClassArr = [];
    for(var i in classDict){
        dict = classDict[i];
        var newClass = new UnivClass();
        newClass.crn = dict["CRN"];
        newClass.name = dict["title"];
        newClass.instructor = dict["instructor"];
        newClass.classTimes = convertToClassTimes(dict["day_times"]);
        newClass.type = dict["type"];
        newClass.sec = dict["sec"];
        newClass.classPage = dict["class_page"];
        newClass.stat = dict["status"];
        newClass.subjCode = dict["subj_code"];
        newClass.courseNo = dict["course_no"];
        newClass.color = $("#color2").css('background-color'); 
        uClassArr.push(newClass);
    }
    return uClassArr;
}

function convertToClassTimes(dict){
    for(var i in dict){
        var timeDict;
        var times = dict[i];
        var updatedTimes = {};
        var re = new RegExp(" ", 'g')
        times = times.replace(re, "").split("-");
        updatedTimes["start"] = times[0];
        updatedTimes["startTime"] = timeStringToTime(times[0]);
        updatedTimes["end"] = times[1];
        updatedTimes["endTime"] = timeStringToTime(times[1]);
        dict[i] = updatedTimes;
    }
    return dict
}

function setResultInfo(id){
    var index = parseInt(id);
    var uniClass = queryResults[index];
    var overlap = classOverlap(uniClass); 
    var times = uniClass.classTimes;

    $("#crn_info").html(uniClass.crn);
    if(overlap === ""){
        $("#fit_info").html("yes");
    }
    else{
        $("#fit_info").html("conflict with " + overlap); 
    }
    $("#more_info").html("webtms").attr("href", 'https://duapp2.drexel.edu' + uniClass.classPage);
    
    var classTimes = convertTimesToString(times);
    
    for(var i = 0; i < 5; i++){
        $("#info_weekday"+i.toString()).text('');
        $("#info_time"+i.toString()).text('');
    }

    if(classTimes.length === 0){
        $("#info_weekday0").text("TBD");
    }
    else{
        var timeItem;

        for(var i in classTimes){
            timeItem = classTimes[i];
            $("#info_weekday"+i.toString()).text(timeItem[0]);
            $("#info_time"+i.toString()).text(timeItem[1]);
        }
    }
}

function clearResultInfo(){
    $("#crn_info").html("");
    $("#fit_info").html("");
    $("#more_info").html("");
    
    for(var i = 0; i < 5; i++){
        $("#info_weekday"+i.toString()).text('');
        $("#info_time"+i.toString()).text('');
    }
}

function setResultInfo(id){
    var index = parseInt(id);
    var uniClass = queryResults[index];
    var overlap = classOverlap(uniClass); 
    var times = uniClass.classTimes;

    $("#crn_info").html(uniClass.crn);
    if(overlap === ""){
        $("#fit_info").html("yes");
    }
    else{
        $("#fit_info").html("conflict with " + overlap); 
    }
    $("#more_info").html("webtms").attr("href", 'https://duapp2.drexel.edu' + uniClass.classPage);
    
    var classTimes = convertTimesToString(times);
    
    for(var i = 0; i < 5; i++){
        $("#info_weekday"+i.toString()).text('');
        $("#info_time"+i.toString()).text('');
    }

    if(classTimes.length === 0){
        $("#info_weekday0").text("TBD");
    }
    else{
        var timeItem;

        for(var i in classTimes){
            timeItem = classTimes[i];
            $("#info_weekday"+i.toString()).text(timeItem[0]);
            $("#info_time"+i.toString()).text(timeItem[1]);
        }
    }
}

function convertTimesToString(times){
    var days = ['M', 'T', 'W', 'R', 'F', 'S'];
    var completeArr = [];
    var time;
    var compareTime;
    var broke;

    for(var i in days){
        if(days[i] in times){
            time = times[days[i]];
            time = time["start"] + " - " + time["end"];
            broke = false;
            for(var j in completeArr){
                compareTime = completeArr[j][1];
                if(time == compareTime){
                    completeArr[j][0] += days[i];
                    broke = true;
                    break;
                }
            }
            if(!broke){
                completeArr.push([days[i], time]);
            }
        }
    }
    return completeArr;
}

function addQueryClass(newClass){
    var classMatch = classOverlap(newClass);
    
    if(classMatch === ""){
	    newClass.id = createUniqueId();
        addClassToLS(newClass);
	    $("#class_select").append( $('<option></option>').val(newClass.id).html(newClass.name + " - " + newClass.crn));
	    drawClasses();
	    resetForm();
    }
    else{
        $("#error_box").text("overlaps with class: " + classMatch);
    }
}

function setScheduleItem(){
    var newClass = new UnivClass();
    newClass.crn = $("#crn").val();	
    newClass.name = $("#class_name").val();
    newClass.color = $("#color1").css('background-color');
    newClass.classTimes = {};
    if($('.selected_day_choice').attr('id') == 'different_times'){
        $('.selected_day').each(function(){
            var key = $(this).attr('id');
            var timeEntry = $(this).children('.time_entry');
            newClass.classTimes[key] = {};
            newClass.classTimes[key]['start'] = timeEntry.children('.start').val() + timeEntry.children('.start_select').children('option:selected').val();
            newClass.classTimes[key]['startTime'] = timeStringToTime(newClass.classTimes[key]['start']);
            newClass.classTimes[key]['end'] = timeEntry.children('.end').val() + timeEntry.children('.end_select').children('option:selected').text();
            newClass.classTimes[key]['endTime'] = timeStringToTime(newClass.classTimes[key]['end']);          
        }); 
    }
    else{
        $('.selected_day').each(function(){
            var key = $(this).attr('id');
            newClass.classTimes[key] = {};
            newClass.classTimes[key]['start'] = $('#startTime').val() + $('#time_start option:selected').text();
            newClass.classTimes[key]['startTime'] = timeStringToTime(newClass.classTimes[key]['start']);
            newClass.classTimes[key]['end'] = $('#endTime').val() + $('#time_end option:selected').text();
            newClass.classTimes[key]['endTime'] = timeStringToTime(newClass.classTimes[key]['end']);
        });
    }
    if(errorCheck(newClass)){
        newClass.id = createUniqueId();
        addClassToLS(newClass);
	$("#class_select").append( $('<option></option>').val(newClass.id).html(newClass.name + " - " + newClass.crn));
	drawClasses();
	resetForm();
    }
}

function removeClass(){
    var deletedItem = $("#class_select").val();
    removeClassFromLS(deletedItem);
    $("#class_select option:selected").remove();
    drawClasses();
}

function errorCheck(newClass){
    var errorBox = $("#error_box");
    var classMatch = classOverlap(newClass);
    if(!areClassTimesValid(newClass)){
	errorBox.text("end time can't be before or the same as start time");
    }
    else if(!verifyTimeFormat(newClass)){
    errorBox.text("times aren't valid");
    }
    else if(newClass.name === ""){
	errorBox.text("can't leave class name blank");
    }
    else if(Object.keys(newClass.classTimes).length === 0){
    errorBox.text("you must select at least one day of the week");
    }
    else if(classMatch !== ""){
	errorBox.text("overlaps with class: " + classMatch);
    }
    else{
	errorBox.text("");
	return true;
    }
    return false;
}

function areClassTimesValid(newClass){
    var times;
    for(var key in newClass.classTimes){
        times = newClass.classTimes[key]
        if(times['startTime'] > times['endTime']){
            return false;
        }
    }
    return true;
}

function verifyTimeFormat(newClass){
    var pattern = '^[0-9]{1,2}(:\\d\\d)?(am|pm)';
    
    for(var dayOfWeek in newClass.classTimes){
        var times = newClass.classTimes[dayOfWeek];
        var start = times['start'];
        var end = times['end'];
        
        if(start.search(pattern) == -1 || end.search(pattern) == -1){
            return false;
        }
        
        var startMinutes = parseInt(start.substring(start.length-4, start.length - 2));
        var endMinutes = parseInt(end.substring(end.length-4, end.length - 2));
        
        if(startMinutes >= 60 || endMinutes >= 60){
            return false;
        }
        else if(times['startTime'] >= timeMax || times['endTime'] > timeMax || times['startTime'] < timeMin || times['endTime'] <= timeMin){
            return false;
        }
    }
    return true;
}

function classOverlap(newClass){
    var compareClass;
    var compareStart;
    var compareEnd;
    var newStart;
    var newEnd;
    var classes = JSON.parse(localStorage['classes']);
    
    for(classKey in classes){
        compareClass = classes[classKey]; 
        for(day in compareClass.classTimes){
	        if(day in newClass.classTimes){
                newStart = newClass.classTimes[day]['startTime'];
                newEnd = newClass.classTimes[day]['endTime'];
                compareStart = compareClass.classTimes[day]['startTime'];
                compareEnd = compareClass.classTimes[day]['endTime'];
                if((compareStart <  newEnd && compareStart >= newStart) || (compareEnd <=  newEnd &&  compareEnd > newStart)){
                    return compareClass.name;
                }
            }
        }
    }
    return "";
}

function resetForm(){
    $("#color1").css("background-color", "#3289c7");
    $("#crn").val("");
    $(".selected_day").removeClass("selected_day");
    $("#class_name").val("");

    if($('.selected_day_choice').attr('id') == 'different_times'){
        $('.start').val('');
        $('.end').val('');
        $('.start_select').val('am');
        $('.end_select').val('am');
    }
    else{
        $('#startTime').val('');
        $('#endTime').val('');
        $("#time_start").val("am");
        $("#time_end").val("am");
    }
}

function getClasses(){
    try{
        var classes = JSON.parse(localStorage['classes']);
	for(key in classes){
	    try{
	        if(classes[key].version < 0.51) throw "outdated UnivClass object";
	        $("#class_select").append( $('<option></option>').val(classes[key].id).html(classes[key].name +" - " + classes[key].crn));
	        drawClasses();
	    }
	    catch(err){
		console.log(err.message);
                clearLocalStorage();
            }
        }
    }
    catch(err){
        console.log(err.message);
        localStorage.removeItem("classes");
    }
}

function addClassToLS(newClass){
    classes = JSON.parse(localStorage["classes"]);
    classes[newClass.id] = newClass;
    localStorage.setItem("classes", JSON.stringify(classes));
}

function removeClassFromLS(key){
    classes = JSON.parse(localStorage["classes"]);
    delete classes[key];
    localStorage.setItem("classes", JSON.stringify(classes));
}

function checkLocalStorage(){
    if(localStorage.getItem("classes") === null){
        localStorage.setItem("classes", JSON.stringify({}));
    }
}

function clearLocalStorage(){
    localStorage.setItem("classes", JSON.stringify({}));
}

function createUniqueId(){
    var classes = [];
    for(var i in JSON.parse(localStorage.getItem("classes"))){
        classes.push(parseInt(i));
    }
    
    if(classes.length != 0){
        return Math.max.apply(null, classes) + 1;
    }
    else{
        return 0;
    }
}
function UnivClass(){
    this.classTimes;
    this.name;
    this.instructor;
    this.type;
    this.sec;
    this.classPage;
    this.stat;
    this.subjCode;
    this.courseNo;
    this.color;
    this.crn;
    this.version = 0.51;
    this.id; 
}

function timeStringToTime(timeString){
    var hour;
    var min;
    var am_pm = timeString.slice(timeString.length - 2,timeString.length);
    timeString = timeString.slice(0,timeString.length-2);
    if(timeString.length < 3){
        hour = parseInt(timeString);
        min = 0;
    }
    else{
        timeSplit = timeString.split(":");
        hour = parseInt(timeSplit[0]);
        min = parseInt(timeSplit[1])
    }
    if(am_pm == "pm"){
        if(timeSplit[0] === 12){
            hour = 12;
        }
        else{
            hour = hour + 12;
        }
    }
    return hour*60+min;
}
