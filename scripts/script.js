var graphWidth = 1100;
var graphHeight = 560;
var hourStart = 8 //8am
var hourEnd = 22 //10pm
var timeMin = hourStart*60;
var timeMax = hourEnd*60;

$(document).ready(
function(){
    var canvas = document.getElementById("schedule");
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
	    }else{
                $("#time_div").stop().slideUp();
	    }
	}
    });

    $("#save_schedule_image")
    .click(function(){
        params = { imgdata : canvas.toDataURL('image/jpeg') };
        $.post('/save', params, function (data) { /* ... */ }) 
     });
     
    $("#add_class")
    .mousedown(function(){
        $(this).css('background-color', 'ab38e0').css('border-color', '#aa34d9')
    })
    .mouseup(function(){
        $(this).css('background-color', '#ed2bff').css('border-color', '#ca35e8')
        setScheduleItem();
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
	    timeEntry.slideDown();
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
	$(this).parent().slideUp();
	e.stopPropagation();
    });

    $(document)
    .mouseup(function(e){
	if($(e.target).attr('class') != 'time_entry' && $(e.target).parent().attr('class') != 'time_entry'){
	    $(".time_entry").slideUp().parent().removeClass('open_time_entry');
	}
    });
   

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
    clearCanvas();

    for(i in localStorage){
        var textWidth;
        var textHeight;
        var text;
        var time;

        uniClass = JSON.parse(localStorage[i]);
        for(j in uniClass.daysOfWeek){
            context.fillStyle = uniClass.color;
            x = 95*2 + (parseInt(uniClass.daysOfWeek[j])*(graphWidth/7)*2);
            y = 45*2 + (((uniClass.start - timeMin)/(timeMax - timeMin))*graphHeight*2);
            width = graphWidth/7*2;
            height = (((uniClass.end - uniClass.start)/(timeMax - timeMin))*graphHeight*2);
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
                time = uniClass.startTime+"-"+uniClass.endTime;
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
    var rect = canvas.getBoundingClientRect();

    mouse_x = (e.clientX - rect.left)*2;
    mouse_y = (e.clientY - rect.top)*2;

    for(i in localStorage){
        uniClass = JSON.parse(localStorage[i]);
        for(j in uniClass.daysOfWeek){
            x = 95*2 + (parseInt(uniClass.daysOfWeek[j])*(graphWidth/7)*2) + 2;
            y = 45*2 + (((uniClass.start - timeMin)/(timeMax - timeMin))*graphHeight*2) + 2;
            width = graphWidth/7*2 - 4;
            height = (((uniClass.end - uniClass.start)/(timeMax - timeMin))*graphHeight*2) + 2;
            max_x = x + width;
            max_y = y + height;

            if(mouse_x >= x && mouse_x <= max_x && mouse_y >= y && mouse_y >= y && mouse_y <= max_y){
                alert(uniClass.name + "\n" + uniClass.crn);
                break;
            }
        }
    }
}

function queryClasses(){
	if($("#query_select").text() == "CRN"){
		var crn = $("#crn_input").val();
		$.ajax({url:"/",
			type:'GET',
			data: {'id':crn}, 
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
					newClass.start = timestringToTime(times[0]);
					newClass.endTime = times[1];
					newClass.end = timestringToTime(times[1]);
					newClass.color = $("#color_picker2").val();
					newClass.name = class_dict["subj_code"].concat(" ");
					newClass.name = newClass.name.concat(classDict["course_no"]);
					newClass.name = newClass.name.concat(" - ");
					newClass.name = newClass.name.concat(classDict["sec"]);
					newClass.crn = classDict["CRN"];
					console.log(newClass.crn);
					if(errorCheck(newClass)){
						localStorage[newClass.name] = JSON.stringify(newClass);
						$("#class_select").append( $('<option></option>').val(newClass.name).html(newClass.name + " - " + newClass.crn));
						drawClasses();
						resetForm();
					}
		}});
	}
	else{
		var title = $("#crn_input").val();
		$.ajax({url:"/",
			type:'GET',
			data: {'title':crn}, 
			success:function(data){
				console.log(JSON.parse(data));
			}
		});
	}
}

function setScheduleItem()
{
	var newClass = new UnivClass();
	newClass.name = $("#class_name").val();
	newClass.start = timestringToTime($("#time_start option:selected").text());
	newClass.startTime = $("#time_start option:selected").text();
	newClass.end = timestringToTime($("#time_end option:selected").text());
	newClass.endTime = $("#time_end option:selected").text();
	newClass.color = $("#color_picker").val();
	newClass.daysOfWeek = $('input:checkbox:checked.day').map(function () {
		return this.value;
}).get();
	newClass.crn = $("#crn").val();	
	if(errorCheck(newClass)){
		localStorage[newClass.name] = JSON.stringify(newClass);
		$("#class_select").append( $('<option></option>').val(newClass.name).html(newClass.name + " - " + newClass.crn));
		drawClasses();
		resetForm();
	}
}

function removeClass(){
    var deletedItem = $("#class_select").val();
	localStorage.removeItem(deleted_item);
	$("#class_select option:selected").remove()
	drawClasses();
}

function errorCheck(newClass){
	var errorBox = $("#error_box");
	var classMatch = classOverlap(newClass);
	
	if(newClass.end < newClass.start){
		errorBox.text("end time can't be before or the same as start time");
	}
	else if(newClass.name === ""){
		errorBox.text("can't leave class name blank");
	}
	else if(newClass.days_of_week.length === 0){
		errorBox.text("you must select at least one day of the week");
	}
	else if(sameClass_name(new_class)){
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

function sameClassName(newClass){
	for(i in localStorage){
		if(JSON.parse(localStorage[i]).name === newClass.name)
		{
			return true;
		}
	}
	return false;
}

function classOverlap(newClass){
	var daysMatch = false;
	var classCompare;
	var result;
	
	for(i in localStorage){
		for(n in JSON.parse(localStorage[i]).daysOfWeek){
			result = newClass.daysOfWeek.indexOf(JSON.parse(localStorage[i]).daysOfWeek[n]);
			if(result !== -1){
				daysMatch = true;
				classCompare = JSON.parse(localStorage[i]);
				break;
			}
		}
		if(daysMatch){
			if(classCompare.start >=  newClass.end ||  classCompare.end <=  newClass.start)
			{
				daysMatch = false;
			}
			else{
				return classCompare.name;
			}
		}
	}
	return false;
}

function resetForm(){
	$(".day").attr("checked", false);
	$("#class_name").val("");
	$("#time_start").val("0");
	$("#time_end").val("0");
	$("#color_picker").val("#00FFFF");
	$("#crn").val("");
}

function getClasses(){
	if(localStorage != null){
		for(key in localStorage){
			$("#class_select").append( $('<option></option>').val(JSON.parse(localStorage[key]).name).html(JSON.parse(localStorage[key]).name +" - " + JSON.parse(localStorage[key]).crn));
		}
	    drawClasses();
	}
}

function UnivClass(){
	this.daysOfWeek;
	this.name;
	this.start;
	this.startTime;
	this.end;
	this.endTime;
	this.color;
	this.crn;
}

function timestringToTime(timeString){
    var hour;
    var min;
    var am_pm = timestring.slice(timestring.length - 2,timestring.length);
    timestring = timestring.slice(0,timestring.length-2);
    timeSplit = timestring.split(":");


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
