var graph_width = 1100;
var graph_height = 560;
var time_min = 480;
var time_max = 1320;

$(document).ready(
function(){
	var canvas = document.getElementById("schedule");
	$("#ui2").hide();
	$(".button").click(function(){
		if($(this).css("background-color") == "rgb(151, 173, 166)"){
			$(this).css("background-color","rgb(211, 224, 227)");
			if($(this).attr("id") == "button1"){
				$("#ui1").show();
				$("#ui2").hide();
				$("#button2").css("background-color","rgb(151, 173, 166)");
			}
			else{
				$("#ui2").show();
				$("#ui1").hide();
				$("#button1").css("background-color","rgb(151, 173, 166)");
			}
		}
	});	
	draw_canvas();
	get_classes();
	canvas.onclick = function(e){click_class(e, canvas);
	}
});

function draw_canvas(){
    var canvas = document.getElementById("schedule");
    var context = canvas.getContext("2d");
    var days_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    var times = ["8:00am", "9:00am", "10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm", "6:00pm", "7:00pm", "8:00pm", "9:00pm", "10:00pm"]

    for(var i = 0; i < 7; i++){
        context.beginPath();
        context.lineWidth="4";
        context.strokeStyle="black";
        context.rect(95*2 + (i*(graph_width/7)*2), 45*2, graph_width/7*2, graph_height*2);
        context.stroke();
    }

    for(var i in days_of_week){
        context.fillStyle = "black";
        context.font = "40px Arial";
        context.textAlign = 'left';
        context.fillText(days_of_week[i], 130*2+(i*(graph_width/7))*2, 35*2)
    }
	
	for(var i in times){
	    context.fillStyle = "black";
		context.font = "30px Arial";
		context.textAlign = 'left';
        context.fillText(times[i], 0, 100 + (600*2)/times.length*i)
	}
}

function clear_canvas(){
    var canvas = document.getElementById("schedule");
    var context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function draw_classes(){
    var canvas = document.getElementById("schedule");
    var context = canvas.getContext("2d");
    var uni_class;
    var height;
    clear_canvas();

    for(i in localStorage){
        var text_width;
        var text_height;
        var text;
        var time;

        uni_class = JSON.parse(localStorage[i]);
        for(j in uni_class.days_of_week){
            context.fillStyle = uni_class.color;
            x = 95*2 + (parseInt(uni_class.days_of_week[j])*(graph_width/7)*2);
            y = 45*2 + (((uni_class.start-time_min)/(time_max-time_min))*graph_height*2);
            width = graph_width/7*2;
            height = (((uni_class.end - uni_class.start)/(time_max-time_min))*graph_height*2);
            context.fillRect(x + 2,y + 2, width - 4, height + 2);
            context.fillStyle = "black";
		    context.font = "25px Arial";
		    context.textAlign = 'center';
		    text = uni_class.name;
            text_width = context.measureText(text).width;
            while(text_width > 275){
                text = text.slice(0,text.length-1);
                text_width = context.measureText(text).width;
                if(text_width <= 275){
                    text = text.concat("...")
                }
            }
            context.fillText(text, x + (width/2), y+22+(height/4));

            if(height >= 75){
                time = uni_class.start_time+"-"+uni_class.end_time;
                context.fillText(time, x + (width/2), y+30+(height/2));
            }
        }
    }
    draw_canvas();
}

function click_class(e, canvas){
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
        uni_class = JSON.parse(localStorage[i]);
        for(j in uni_class.days_of_week){
            x = 95*2 + (parseInt(uni_class.days_of_week[j])*(graph_width/7)*2) + 2;
            y = 45*2 + (((uni_class.start-time_min)/(time_max-time_min))*graph_height*2) + 2;
            width = graph_width/7*2 - 4;
            height = (((uni_class.end - uni_class.start)/(time_max-time_min))*graph_height*2) + 2;
            max_x = x + width;
            max_y = y + height;

            if(mouse_x >= x && mouse_x <= max_x && mouse_y >= y && mouse_y >= y && mouse_y <= max_y){
                alert(uni_class.name + "\n" + uni_class.crn);
                break;
            }
        }
    }
}

function get_class_by_crn(){
	var crn = $("#crn_input").val();
	$.ajax({url:"/", type:'GET',data: {'id':crn}, success:
	function(data){
		var class_dict = JSON.parse(data);
		var new_class = new univ_class();		
		var days = class_dict["days"];
		var days_of_class = [];
		var times = class_dict["time"];		
		var week = ['M','T','W','R','F','S'];
		for(var i in week){				
			if(days.search(week[i]) != -1){
				days_of_class.push(i);
			}
		}
		new_class.days_of_week = days_of_class;
		times = times.split("-");
		for(var i in times){
			times[i] = times[i].replace(" ","");
			times[i] = times[i].replace(" ","");
			if(times[i].charAt(0) == "0"){
				times[i] = times[i].substring(1);			
			}		
		}
		new_class.start_time = times[0];
		new_class.start = timestring_to_time(times[0]);
		new_class.end_time = times[1];
		new_class.end = timestring_to_time(times[1]);
		new_class.color = $("#color_picker2").val();
		new_class.name = class_dict["subj_code"].concat(" ");
		new_class.name = new_class.name.concat(class_dict["course_no"]);
		new_class.name = new_class.name.concat(" - ");
		new_class.name = new_class.name.concat(class_dict["sec"]);
		new_class.crn = class_dict["CRN"];
		console.log(new_class.crn);
		if(error_check(new_class)){
			localStorage[new_class.name] = JSON.stringify(new_class);
			$("#class_select").append( $('<option></option>').val(new_class.name).html(new_class.name + " - " + new_class.crn));
			draw_classes();
			reset_form();
		}
	}});
}


function set_schedule_item()
{
	var new_class = new univ_class();
	new_class.name = $("#class_name").val();
	new_class.start = timestring_to_time($("#time_start option:selected").text());
	new_class.start_time = $("#time_start option:selected").text();
	new_class.end = timestring_to_time($("#time_end option:selected").text());
	new_class.end_time = $("#time_end option:selected").text();
	new_class.color = $("#color_picker").val();
	new_class.days_of_week = $('input:checkbox:checked.day').map(function () {
		return this.value;
}).get();
	new_class.crn = $("#crn").val();	
	if(error_check(new_class)){
		localStorage[new_class.name] = JSON.stringify(new_class);
		$("#class_select").append( $('<option></option>').val(new_class.name).html(new_class.name + " - " + new_class.crn));
		draw_classes();
		reset_form();
	}
}

function remove_class(){
    var deleted_item = $("#class_select").val();
	localStorage.removeItem(deleted_item);
	$("#class_select option:selected").remove()
	draw_classes();
}

function error_check(new_class){
	var error_box = $("#error_box");
	var class_match = class_overlap(new_class);
	
	if(new_class.end < new_class.start){
		error_box.text("end time can't be before or the same as start time");
	}
	else if(new_class.name === ""){
		error_box.text("can't leave class name blank");
	}
	else if(new_class.days_of_week.length === 0){
		error_box.text("you must select at least one day of the week");
	}
	else if(same_class_name(new_class)){
		error_box.text("can't have a class with the same name");
	}
	else if(class_match != false){
		error_box.text("overlaps with class: " + class_match);
	}
	else{
		error_box.text("");
		return true;
	}
	return false;
}

function same_class_name(new_class){
	for(i in localStorage){
		if(JSON.parse(localStorage[i]).name === new_class.name)
		{
			return true;
		}
	}
	return false;
}

function class_overlap(new_class){
	var days_match = false;
	var class_compare;
	var result;
	
	for(i in localStorage){
		for(n in JSON.parse(localStorage[i]).days_of_week){
			result = new_class.days_of_week.indexOf(JSON.parse(localStorage[i]).days_of_week[n]);
			if(result !== -1){
				days_match = true;
				class_compare = JSON.parse(localStorage[i]);
				break;
			}
		}
		if(days_match){
			if(class_compare.start >=  new_class.end ||  class_compare.end <=  new_class.start)
			{
				days_match = false;
			}
			else{
				return class_compare.name;
			}
		}
	}
	return false;
}

function reset_form(){
	$(".day").attr("checked", false);
	$("#class_name").val("");
	$("#time_start").val("0");
	$("#time_end").val("0");
	$("#color_picker").val("#00FFFF");
	$("#crn").val("");
}

function get_classes(){
	if(localStorage != null){
		for(key in localStorage){
			$("#class_select").append( $('<option></option>').val(JSON.parse(localStorage[key]).name).html(JSON.parse(localStorage[key]).name +" - " + JSON.parse(localStorage[key]).crn));
		}
	    draw_classes();
	}
}

function univ_class(){
	this.days_of_week;
	this.name;
	this.start;
	this.start_time;
	this.end;
	this.end_time;
	this.color;
	this.crn;
}

function timestring_to_time(timestring){
    var hour;
    var min;
    var am_pm = timestring.slice(timestring.length - 2,timestring.length);
    timestring = timestring.slice(0,timestring.length-2);
    time_split = timestring.split(":");


    if(am_pm == "pm"){
        if(parseInt(time_split[0]) === 12){
            hour = 12;
        }
        else{
            hour = parseInt(time_split[0]) + 12;
        }
    }
    else{
        hour = parseInt(time_split[0]);
    }
    min = parseInt(time_split[1]);

    return hour*60+min;
}
