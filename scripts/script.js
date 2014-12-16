var graphWidth = 1100;
var graphHeight = 560;
var hourStart = "8:00am"
var hourEnd = "10:00pm"
var timeMin = timeStringToTime(hourStart);
var timeMax = timeStringToTime(hourEnd);

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
     
    $("#add_class")
    .click(function(){
        if(clickeable){
            setScheduleItem();
        }
    });
    
    $(".class_button")
    .mousedown(function(){
        $(this).css('background-color', 'ab38e0').css('border-color', '#aa34d9')
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
    checkLocalStorage();
    clearCanvas();	
    drawCanvas();
    getClasses();
    canvas.onclick = function(e){clickClass(e, canvas)}
    addSubjects();
});

function addSubjects(){
    var subjects = ['select', 'ADM', 'ACCT', 'AE', 'AFAS', 'ANAT', 'ANIM', 'ANTH', 'ARBC', 'ARCH', 'ARTH', 'ARTS', 'BACS', 'BIO', 'BLAW', 'BMES', 'BUSN', 'CAE', 'CAEE', 'CAT', 'CFTP', 'CHE', 'CHEC', 'CHEM', 'CHIN', 'CI', 'CIE', 'CIT', 'CIVC', 'CIVE', 'CJ', 'CMGT', 'COM', 'CRTV', 'CS', 'CSDN', 'CST', 'CT', 'CULA', 'DANC', 'DIGM', 'DSMR', 'EAM', 'ECE', 'ECEC', 'ECEE', 'ECEL', 'ECEP', 'ECES', 'ECET', 'ECON', 'EDAE', 'EDAM', 'EDEX', 'EDGI', 'EDHE', 'EDLS', 'EDLT', 'EDPO', 'EDUC', 'EET', 'EGMT', 'EHRD', 'ELL', 'EMER', 'ENGL', 'ENGR', 'ENTP', 'ENVE', 'ENVS', 'ESTM', 'ET', 'EXAM', 'FASH', 'FDSC', 'FIN', 'FMST', 'FMVD', 'FREN', 'GEO', 'GER', 'GMAP', 'GSTD', 'HBRW', 'HIST', 'HNRS', 'HRM', 'HSAD', 'HSCI', 'HSM', 'HUM', 'IAS', 'INDE', 'INFO', 'INTB', 'INTR', 'IPS', 'ITAL', 'JAPN', 'JUDA', 'KOR', 'LANG', 'LING', 'MATE', 'MATH', 'MBC', 'MEM', 'MET', 'MGMT', 'MHT', 'MIP', 'MIS', 'MKTG', 'MLSC', 'MTED', 'MUSC', 'MUSL', 'MUSM', 'NFS', 'NHP', 'NURS', 'OPM', 'OPR', 'ORGB', 'PA', 'PBHL', 'PHEV', 'PHGY', 'PHIL', 'PHTO', 'PHYS', 'PLCY', 'PMGT', 'POM', 'PORT', 'PRMT', 'PROD', 'PROJ', 'PRST', 'PSCI', 'PSY', 'PTRS', 'RADI', 'REAL', 'RSCH', 'RUSS', 'SCRP', 'SCTS', 'SMT', 'SOC', 'SPAN', 'STAT', 'STS', 'SYSE', 'TAX', 'THTR', 'TVIE', 'TVMN', 'TVPR', 'UNIV', 'VSCM', 'VSST', 'WBDV', 'WEST', 'WMGD', 'WMST', 'WRIT'];
    
    for(var i in subjects){
        $('#subject_id').append($('<option></option>').val(subjects[i]).html(subjects[i]));
    }
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
        context.fillText(times[i], 0, 100 + (600*2)/times.length*i)
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
        uniClass = classes[ClassKey];
        for(timeKey in uniClass.classTimes){
            day = uniClass.classTimes[timeKey];
            x = 95*2 + ((getDayNum(timeKey))*(graphWidth/7)*2) + 2;
            y = 45*2 + (((day['startTime'] - timeMin)/(timeMax - timeMin))*graphHeight*2) + 2;
            width = graphWidth/7*2 - 4;
            height = (((day['endTime'] - day['startTime'])/(timeMax - timeMin))*graphHeight*2) + 2;
            max_x = x + width;
            max_y = y + height;

            if(mouse_x >= x && mouse_x <= max_x && mouse_y >= y && mouse_y >= y && mouse_y <= max_y){
                alert(uniClass.name + "\n" + uniClass.crn);
                break;
            }
        }
    }
}

function getDayNum(day){
    numArray = ["M", "T", "W", "R", "F", "S", "SU"];
    return numArray.indexOf(day);       
}

function queryClasses(){
	var request = createRequest();

    $.ajax({url:"/",
		type:'GET',
		data: {'fetch_request':request}, 
		success: function(data){
		    var classDict = JSON.parse(data);
		    var newClass = new UnivClass();		
		    var days = classDict["days"];
		    var daysOfClass = [];
		    var times = classDict["time"];		
		    var week = ['M','T','W','R','F','S'];
		    for(var i in week){				
			    if(days.search(week[i]) != -1){
			        daysOfClass.push(i);
			    }
		    }
		    newClass.daysOfWeek = daysOfClass;
		    times = times.split("-");
		    for(var i in times){
			    times[i] = times[i].replace(" ","");
			    times[i] = times[i].replace(" ","");
			    if(times[i].charAt(0) == "0"){
			        times[i] = times[i].substring(1);			
			    }		
		    }
		    newClass.startTime = times[0];
		    newClass.start = timeStringToTime(times[0]);
            newClass.endTime = times[1];
            newClass.end = timeStringToTime(times[1]);
            newClass.color = $("#color2").val();
            newClass.name = class_dict["subj_code"].concat(" ");
            newClass.name = newClass.name.concat(classDict["course_no"]);
            newClass.name = newClass.name.concat(" - ");
            newClass.name = newClass.name.concat(classDict["sec"]);
            newClass.crn = classDict["CRN"];
            if(errorCheck(newClass)){
                addClassToLS(newClass);
                $("#class_select").append( $('<option></option>').val(newClass.name).html(newClass.name + " - " + newClass.crn));
                drawClasses();
                resetForm();
            }    
    }});      
}

function createRequest(){
    var request = {};
    var method = $("input[name='query']:checked").val();
   
    request["term"] = $("#term_select").val();

    if(method == "crn"){
        request["crn"] = $("#crn_input").val();
    }
    else if(method == "subject"){
        request["subject"] = $("#subject_id").val();
        request["subject_number"] = $("#subject_number").val();
    }
    else{
        request["title"] = $("#crs_name").val();
    }
    console.log(method);

    return request;
}

function setScheduleItem()
{
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
	addClassToLS(newClass);
	$("#class_select").append( $('<option></option>').val(newClass.name).html(newClass.name + " - " + newClass.crn));
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
    else if(verifyTimeFormat(newClass)){
    errorBox.text("times aren't valid");
    }
    else if(newClass.name === ""){
	errorBox.text("can't leave class name blank");
    }
    else if(Object.keys(newClass.classTimes).length === 0){
    errorBox.text("you must select at least one day of the week");
    }
    else if(sameClassName(newClass)){
	errorBox.text("can't have a class with the same name");
    }
    else if(classMatch != false){
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
    var pattern = '^[0-9]{1,2}:\d\d(am|pm)';
    for (dayOfWeek in newClass.classTimes){
        var times = newClass.classTimes[dayOfWeek];
        var start = times['start'];
        var end = times['end'];
        
        if(start.search(pattern) == -1 || end.search(pattern) == -1){
            return false;
        }
        
        var startMinutes = parseInt(start.substring(start.length-4, start.length - 2));
        var endMinutes = parseInt(end.substring(end.length-4, end.length - 2));
     
        if(startMinutes > 60 || endMinutes > 60){
            return false;
        }
        else if(times['startTime'] >= timeMax || times['endTime'] > timeMax || times['startTime'] < timeMin || times['endTime'] <= timeMin){
            return false;
        }
        else{
            return true;
        }
    }
}

function sameClassName(newClass){
    var classes = JSON.parse(localStorage['classes']);
    for(classKey in classes){
	if(classes[classKey].name === newClass.name){
	    return true;
	}
    }
    return false;
}

function classOverlap(newClass){
    var compareClass;
    var classes = JSON.parse(localStorage['classes']);
    
    for(classKey in classes){
        compareClass = classes[classKey]; 
        for(day in compareClass.classTimes){
	    if(day in newClass.classTimes){
		newClassTimes = newClass.classTimes[day]
                compareClassTimes = compareClass.classTimes[day]
                if(!(compareClass.start >=  newClass.end ||  compareClass.end <=  newClass.start)){
		    return compareClass.name;
                }
            }
        }
    }
    return false;
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
        $("#time_start").val("am");
        $("#time_end").val("am");
    }
}

function getClasses(){
    try{
        var classes = JSON.parse(localStorage['classes']);
	for(key in classes){
	    try{
	        if(classes[key].version < 0.4) throw "outdated UnivClass object";
	        $("#class_select").append( $('<option></option>').val(classes[key].name).html(classes[key].name +" - " + classes[key].crn));
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
    classes[newClass.name] = newClass;
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

function UnivClass(){
    this.classTimes;
    this.name;
    this.color;
    this.crn;
    this.version = 0.4;
}

function timeStringToTime(timeString){
    var hour;
    var min;
    var am_pm = timeString.slice(timeString.length - 2,timeString.length);
    timeString = timeString.slice(0,timeString.length-2);
    timeSplit = timeString.split(":");

    if(am_pm == "pm"){
        if(parseInt(timeSplit[0]) === 12){
            hour = 12;
        }
        else{
            hour = parseInt(timeSplit[0]) + 12;
        }
    }
    else{
        hour = parseInt(timeSplit[0]);
    }
    min = parseInt(timeSplit[1]);

    return hour*60+min;
}
