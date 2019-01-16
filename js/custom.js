var cur_id = 0;

function getLastId() {
  var last_id = localStorage.getItem("last_id");
  if (last_id) {
    return 0;
  }
  return last_id;
}
$(document).ready(function () {
  cur_id = getLastId() + 1;
  $(".calendar-container").each(function () {
    $(this).hide();
  });

  jQuery(".datepicker").datepicker({
    autoclose: true,
    todayHighlight: true
  });

  $("#inputGroupfile_xls").click(function () {
    $("#my_file_input").click();
  });

/*$(".htrash").on( 'click',function () {
  alert($this.prev().html());
});
$('body').on('click', 'htrash', function () {
  //alert($this.prev().html());
  alert('hey');
});*/
  oFileIn = document.getElementById("my_file_input");
  if (oFileIn.addEventListener) {
    oFileIn.addEventListener("change", filePicked, false);
  }

  $(".row.events input[type='radio']").click(function () {
    $.CalendarApp.selected_event = $(this);
    // $(".fc-highlight").css("background", $(this).next().css("background-color"));
  });
  $(".row.events input[type='radio'].default").click();

  $("#btn_calc").click(function () {
    var sum1 = 0,
      sum2 = 0;
    var jsonDatas = localStorage.getItem("reserve_data_" + cur_id);
    var reserved_data = JSON.parse(jsonDatas);
    var date_from, date_to;

    var events = getCalenderInfo();

    var sum = {};

    // Test
    // console.log('Test 2');
    // console.log(events);

    for (var event of events) {
      var title = event["title"];
      sum[title] = sum[title] ? sum[title] : 0;
      var start_date = new Date(event["start_date"]);
      var end_date = new Date(event["end_date"]);
      for (var data of reserved_data.data) {
        var date_arrival = new Date(data.Arrival);
        var date_departure = new Date(data.Departure);
        console.log('***');
        
        if ((addDays(start_date,-1) < date_arrival) && (addDays(date_departure,-1) < end_date)) {
          sum[title] += data["Commission amount"] * 1 ;//* (getLeftDays(addDays(date_departure,1),start_date))/(getLeftDays(addDays(date_departure, 1),date_arrival));
        }
        else if((addDays(date_arrival,-1) < start_date) && (addDays(start_date,-1) < date_departure)) {
        //  sum[title] += data["Commission amount"] * 1 * (getLeftDays(addDays(date_departure,0),start_date))/(getLeftDays(addDays(date_departure,0),date_arrival));
          if((getLeftDays(date_departure,start_date) * 1) == 0)
            sum[title] += data["Commission amount"] * 1 * (getLeftDays(addDays(date_departure,1),start_date))/(getLeftDays(date_departure,date_arrival));
          else
            sum[title] += data["Commission amount"] * 1 * (getLeftDays(date_departure,start_date))/(getLeftDays(date_departure,date_arrival));
          //console.log("title1" + data["Commission amount"] * 1 * (getLeftDays(date_departure,start_date))/(getLeftDays(date_departure,date_arrival)));
        }
        else if((addDays(date_arrival,-1) < end_date) && (addDays(end_date,-1) < date_departure)) {
          //sum[title] += data["Commission amount"] * 1 * (getLeftDays(addDays(end_date,0),date_arrival))/(getLeftDays(addDays(date_departure, 0),date_arrival));
          if(getLeftDays(addDays(end_date,1),date_departure) == 0)
            sum[title] += data["Commission amount"] * 1 * (getLeftDays(end_date,date_arrival))/(getLeftDays(date_departure,date_arrival));
          else
            sum[title] += data["Commission amount"] * 1 * (getLeftDays(addDays(end_date,1),date_arrival))/(getLeftDays(date_departure,date_arrival));
          // console.log("title " + data["Commission amount"] * 1 * (getLeftDays(end_date,date_arrival))/(getLeftDays(date_departure,date_arrival)));
        }
      }
    }

    $("#MrNatan").html(
      sum["Mr. Natan"] ? Math.round(Math.ceil(sum["Mr. Natan"] * 1000000) / 1000000) + ' ILS' : "0"
    );
    $("#MrEli").html(
      sum["Mr. Eli"] ? Math.round(Math.ceil(sum["Mr. Eli"] * 1000000) / 1000000) + ' ILS' : "0"
    );
    // Show total
    let total = sum["Mr. Natan"] + sum["Mr. Eli"];
    $("#Total").html(
      total ? Math.round(Math.ceil(total * 1000000) / 1000000) + ' ILS' : "0"
    );
    // console.log(sum["Mr. Natan"], sum["Mr. Eli"]);
    if ($("#start_date").html() != "Start Date") setHistory(sum);
  });

  $("#btn-calendar").click(function () {
    $("#start_date").html(reserve_data["start_date"]);
    $("#end_date").html(reserve_data["end_date"]);

    $.CalendarApp.reset(reserve_data["start_date"], reserve_data["end_date"]);

    $(".calendar-container").each(function () {
      $(this).show();
    });
    /*$(".fc-past").each(function () {
      $(this).parents(".fc-row").show();
    });*/
  });

  refreshHistory();
});

var histories = [];
function addDays(date1,days){
  //if(days < 1) days = 1;
  var ms = new Date(date1).getTime() + 86400000 * days;
  var tomorrow = new Date(ms);
  return tomorrow;

}
function getLeftDays(m_date1,m_date2){
  // var m_date1 = new Date(date1);
  // var m_date2 = new Date(date2);
  //Set 1 day in milliseconds
  var one_day=1000*60*60*24 
  //Calculate difference btw the two dates, and convert to days
  var a = Math.ceil((m_date1.getTime()-m_date2.getTime())/(one_day));
  return Math.ceil((m_date1.getTime()-m_date2.getTime())/(one_day));
}
function setHistory(sum) {
  var start_date = $("#start_date").html();
  var end_date = $("#end_date").html();
  // var histories = (localStorage.getItem("histories"))?(JSON.parse(localStorage.getItem("histories"))):[];
  var new_histories = {
    date: start_date + " - " + end_date,
    value: sum
  };
  histories.splice(0, 0, new_histories);
  localStorage.setItem("histories", JSON.stringify(histories));
  refreshHistory();
}

function refreshHistory() {
  $histories = $(".history-body");
  $histories.html("");
  histories = localStorage.getItem("histories")
    ? JSON.parse(localStorage.getItem("histories"))
    : [];
  for (var i = 0; i < histories.length; i++) {
    $histories.append(
      $(
        "<div><a data-id='" +
        i +
        "' onclick='showHistory(this)'> " +
        histories[i]["date"] +
        " </a><span class='fa fa-trash htrash' onclick='delHistory("+ i +")'></span></div>"
      )
    );
  }
}

function delHistory(id) {
  if (confirm("Delete history item, Are you sure?")) {
    histories = localStorage.getItem("histories")
      ? JSON.parse(localStorage.getItem("histories"))
      : [];
    for (var i = 0; i < histories.length; i++) {
      if (i == id) histories.splice(i,1);
    }
    localStorage["histories"] = JSON.stringify(histories);
    refreshHistory();
  }
  return false;
}

function showHistory(ancher) {
  var index = $(ancher).attr("data-id");
  var sum = histories[index]["value"] ? histories[index]["value"] : {};
  $("#MrNatan").html(
    sum["Mr. Natan"] ?  Math.round(Math.ceil(sum["Mr. Natan"] * 100000) / 100000) + ' ILS' : "0"
  );
  $("#MrEli").html(
    sum["Mr. Eli"] ?  Math.round(Math.ceil(sum["Mr. Eli"] * 100000) / 100000) + ' ILS' : "0"
  );
  // Show total
  let total = sum["Mr. Natan"] + sum["Mr. Eli"];
  $("#Total").html(
    total ? Math.round(Math.ceil(total * 1000000) / 1000000) + ' ILS' : "0"
  );
}

var reserve_data = {};

function filePicked(oEvent) {
  //     // Get The File From The Input
  var oFile = oEvent.target.files[0];
  var sFilename = oFile.name;
  $("#my_file_input_label").html(sFilename);
  // Create A File Reader HTML5
  var reader = new FileReader();

  // Ready The Event For When A File Gets Selected
  reader.onload = function (e) {
    var data = e.target.result;
    var cfb = XLS.CFB.read(data, { type: "binary" });
    var wb = XLS.parse_xlscfb(cfb);
    // // Loop Over Each Sheet
    wb.SheetNames.forEach(function (sheetName) {
      //     // Obtain The Current Row As CSV
      var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]);
      var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
      $("#my_file_output").html(sCSV);
      var minDate = new Date(
        Math.min.apply(
          null,
          oJS.map(function (e) {
            return new Date(e.Arrival);
          })
        )
      );
      var maxDate = new Date(
        Math.max.apply(
          null,
          oJS.map(function (e) {
            return new Date(e.Departure);
          })
        )
      );

      reserve_data = {
        start_date: minDate.datetoStr(),
        end_date: maxDate.datetoStr(),
        data: oJS,
      }

      // $("#start_date").val(minDate.datetoStr());
      // $("#end_date").val(maxDate.datetoStr());
      localStorage.setItem("reserve_data_" + cur_id, JSON.stringify(reserve_data));
      // show calendar button
      $("#btn-calendar").show();
      //console.log(oJS)
    });
  };

  //     // Tell JS To Start Reading The File.. You could delay this if desired
  reader.readAsBinaryString(oFile);
}

Date.prototype.datetoStr = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
    this.getFullYear()
  ].join("/");
};

Date.prototype.datetoCStr = function () {

  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("-");
};
Date.prototype.datetoCStr2 = function () {

  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = 1;

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("-");
};
// Date.prototype.datetoendCStr = function () {
//   this.setMonth(this.getMonth() + 1);
//   var mm = this.getMonth() + 1; // getMonth() is zero-based
//   var dd = 1;//this.getDate();

//   return [
//     this.getFullYear(),
//     (mm > 9 ? "" : "0") + mm,
//     (dd > 9 ? "" : "0") + dd,
//   ].join("-");
// };

function getCalenderInfo() {
  var events = $("#calendar").fullCalendar("clientEvents");
  var result = [];
  for (var i = 0; i < events.length; i++) {
    var start_date = new Date(events[i].start._d);
    var end_date = "";
    if (events[i].end != null) {
      end_date = new Date(events[i].end._d);
    }
    var title = events[i].title;

    var st_day = start_date.getDate();
    var st_monthIndex = start_date.getMonth() + 1;
    var st_year = start_date.getFullYear();

    var en_day = "";
    var en_monthIndex = "";
    var en_year = "";
    if (end_date != "") {
      end_date.setDate(end_date.getDate() - 1);
      en_day = end_date.getDate();
      en_monthIndex = end_date.getMonth() + 1;
      en_year = end_date.getFullYear();
    }

    result.push({
      title: title,
      start_date: st_year + "-" + st_monthIndex + "-" + st_day,
      end_date: (en_year) ? (en_year + "-" + en_monthIndex + "-" + en_day) : (st_year + "-" + st_monthIndex + "-" + st_day),
    });
  }
  return result;
}

function isCanCalcuate() {
  var jsonDatas = localStorage.getItem("reserve_data_" + cur_id);
  var reserved_data = JSON.parse(jsonDatas);
  // var objData = reserved_data.data;
  var minDate = reserved_data.start_date;
  var maxDate = reserved_data.end_date;
  var getDataArray = function (start, end) {
    var dt = new Date(start);
    var end_date = new Date(end);
    end_date.setDate(end_date.getDate() + 1);
    var dates = new Array();
    while (dt < end_date) {
      dates.push(dt);
      // console.log(dt.datetoCStr());
      dt = new Date(dt.datetoCStr());
      dt.setDate(dt.getDate() + 1);
    }
    return dates;
  }
  var dateArr = getDataArray(minDate, maxDate);
  var dateFlag = new Array();
  for (var i = 0; i < dateArr.length; i++) {
    dateFlag.push(false);
  }
  var events = getCalenderInfo();
  for (var i = 0; i < dateArr.length; i++) {
    for (var event of events) {
      var title = event["title"];
      var start_date = new Date(event["start_date"]);
      start_date.setDate(start_date.getDate() - 1);
      var end_date = new Date(event["end_date"]);
      end_date.setDate(end_date.getDate() + 1);
      // console.log("title: " + title);
      // console.log("start: " + event["start_date"]);
      // console.log("end: " + event["end_date"]);
      // console.log("start: " + start_date.datetoCStr());
      // console.log("end: " + end_date.datetoCStr());
      if (dateArr[i] > start_date && dateArr[i] < end_date) {
        dateFlag[i] = true;
      }
    }
  }
  for (var i = 0; i < dateArr.length; i++) {
    if (dateFlag[i] == false) {
      return false;
    }
  }
  return true;
}

////////////////////////////////////////////
//
// compareDate ----- Compare date by type
// 
// Author: Vlady

function compareDate(date1, date2, type) {
  if(type == 'moment') {
    return (date1._i == date2._i) ? 0 : ((date1._i > date2._i) ? 1 : -1);
  }
}



////////////////////////////////////////////
//
// compareMoment ----- Compare moment date
// 
// Author: Vlady

function compareMoment(date1, date2) {
  return compareDate(date1, date2, 'moment');
}



////////////////////////////////////////////
//
// splitEvents ----- Split events 
// 
// Author: Vlady

function splitEvents(events, start, end, title, className) {
  let eventObjects = [];
  if((events.length == 0) ||
    (end._i < events[0].start._i) ||
    (events[events.length - 1].end._i) < start._i) {
      eventObjects = [
        {
          id: start._i,
          title: title,
          className: className,
          start: start,
          end: end
        }
      ];
      return eventObjects;
  } 
  else {
    events.forEach((event, index) => {
      // case-3: *********
      eventObjects = [
        {
          id: start._i,
          title: title,
          className: className,
          start: start,
          end: end
        }
      ];
    });  
  }
  
  return eventObjects;
}
