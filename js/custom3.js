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
    var commiss_amounts = reserved_data.commisses;

    var events = getCalenderInfo();

    var sum = {};
    for (var event of events) {
      var title = event["title"];
      sum[title] = sum[title] ? sum[title] : 0;
      var start_date = event["start_date"];
      var end_date = event["end_date"];
      var date_count = date_diff_indays(start_date, end_date);
      var dt = new Date(start_date);
      for (var i = 0; i <= date_count; i++) {
        var index = dt.datetoCStr();
        sum[title] += (commiss_amounts[index] ? commiss_amounts[index] : 0) * 1;
        dt.setDate(dt.getDate() + 1);
      }
    }

    $("#MrNatan").html(
      sum["Mr. Natan"] ? Math.ceil(sum["Mr. Natan"] * 100000) / 100000 : "0"
    );
    $("#MrEli").html(
      sum["Mr. Eli"] ? Math.ceil(sum["Mr. Eli"] * 100000) / 100000 : "0"
    );
    if ($("#start_date").val() != "Start Date") setHistory(sum);
  });

  $("#btn-calendar").click(function () {
    $("#start_date").val(reserve_data["start_date"]);
    $("#end_date").val(reserve_data["end_date"]);

    $.CalendarApp.reset(reserve_data["start_date"], reserve_data["end_date"]);

    $(".calendar-container").each(function () {
      $(this).show();
    });
  });

  refreshHistory();
});

var histories = [];

function setHistory(sum) {
  var start_date = $("#start_date").val();
  var end_date = $("#end_date").val();
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
        " </a></div>"
      )
    );
  }
}

function showHistory(ancher) {
  var index = $(ancher).attr("data-id");
  var sum = histories[index]["value"] ? histories[index]["value"] : {};
  $("#MrNatan").html(
    sum["Mr. Natan"] ? Math.ceil(sum["Mr. Natan"] * 100000) / 100000 : "0"
  );
  $("#MrEli").html(
    sum["Mr. Eli"] ? Math.ceil(sum["Mr. Eli"] * 100000) / 100000 : "0"
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

      var commiss_amounts = {};
      for (var item of oJS) {
        var arrival_date = item["Arrival"];
        var Departure_date = item["Departure"];
        var date_count = date_diff_indays(arrival_date, Departure_date);
        var comiss_unit = (item["Commission amount"] * 1) / (date_count + 1);
        var dt = new Date(arrival_date);
        for (var i = 0; i <= date_count; i++) {
          var index = dt.datetoCStr();
          commiss_amounts[index] = (commiss_amounts[index]) ? commiss_amounts[index] + comiss_unit : comiss_unit;
          dt.setDate(dt.getDate() + 1);
        }
      }

      reserve_data = {
        start_date: minDate.datetoStr(),
        end_date: maxDate.datetoStr(),
        data: oJS,
        commisses: commiss_amounts,
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

var date_diff_indays = function (date1, date2) {
  dt1 = new Date(date1);
  dt2 = new Date(date2);
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
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