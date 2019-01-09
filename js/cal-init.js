!(function($) {
  "use strict";

  var CalendarApp = function() {
    this.selected_item = null;
    this.$body = $("body");
    (this.$calendar = $("#calendar")),
      (this.$event = "#calendar-events div.calendar-events"),
      (this.$categoryForm = $("#add-new-event form")),
      (this.$extEvents = $("#calendar-events")),
      (this.$modal = $("#my-event")),
      (this.$saveCategoryBtn = $(".save-category")),
      (this.$calendarObj = null);
  };

  /* on drop */
  (CalendarApp.prototype.onDrop = function(eventObj, date) {
    var $this = this;
    // retrieve the dropped element's stored Event Object
    var originalEventObject = eventObj.data("eventObject");
    var $categoryClass = eventObj.attr("data-class");
    // we need to copy it, so that multiple events don't have a reference to the same object
    var copiedEventObject = $.extend({}, originalEventObject);
    // assign it the date that was reported
    copiedEventObject.start = date;
    if ($categoryClass) copiedEventObject["className"] = [$categoryClass];
    // render the event on the calendar
    $this.$calendar.fullCalendar("renderEvent", copiedEventObject, true);
    // is the "remove after drop" checkbox checked?
    if ($("#drop-remove").is(":checked")) {
      // if so, remove the element from the "Draggable Events" list
      eventObj.remove();
    }
  }),
    /* on select */
    (CalendarApp.prototype.onSelect = function(start, end, allDay) {
      var $this = this;
      var eventObj = $this.selected_event;
      if (!eventObj) {
        return;
      }
      var events = getCalenderInfo();
      var sel_start = new Date(start);
      var sel_end = new Date(end);
      sel_end.setDate(sel_end.getDate() - 1);
      for (var event of events) {
        var title = event["title"];
        var start_date = new Date(event["start_date"]);
        var end_date = new Date(event["end_date"]);
        if (!(sel_end < start_date) && !(sel_start > end_date)) {
          return;
        }
      }

      // retrieve the dropped element's stored Event Object
      var originalEventObject = { title: eventObj.attr("data-title") };
      var $categoryClass = eventObj.attr("data-class");
      // we need to copy it, so that multiple events don't have a reference to the same object
      var copiedEventObject = $.extend({}, originalEventObject);
      // assign it the date that was reported
      copiedEventObject.start = start;
      copiedEventObject.end = end;
      if ($categoryClass) copiedEventObject["className"] = [$categoryClass];
      // render the event on the calendar
      $this.$calendar.fullCalendar("renderEvent", copiedEventObject, true);
      // is the "remove after drop" checkbox checked?
      if (isCanCalcuate()) {
        $("#btn_calc").show();
      } else {
        $("#btn_calc").hide();
      }
    }),
    /* on click on event */
    (CalendarApp.prototype.onEventClick = function(calEvent, jsEvent, view) {
      var $this = this;
      var form = $("<form></form>");
      form.append("<label>Do you want to delete?</label>");
      // form.append("<div class='input-group'><input class='form-control' type=text value='" + calEvent.title + "' /><span class='input-group-btn'><button type='submit' class='btn btn-success waves-effect waves-light'><i class='fa fa-check'></i> Save</button></span></div>");
      $this.$modal.modal({
        backdrop: "static"
      });
      $this.$modal
        .find(".delete-event")
        .show()
        .end()
        .find(".save-event")
        .hide()
        .end()
        .find(".modal-body")
        .empty()
        .prepend(form)
        .end()
        .find(".delete-event")
        .unbind("click")
        .click(function() {
          $this.$calendarObj.fullCalendar("removeEvents", function(ev) {
            return ev._id == calEvent._id;
          });
          if (isCanCalcuate()) {
            $("#btn_calc").show();
          } else {
            $("#btn_calc").hide();
          }
          $this.$modal.modal("hide");
        });
      $this.$modal.find("form").on("submit", function() {
        calEvent.title = form.find("input[type=text]").val();
        $this.$calendarObj.fullCalendar("updateEvent", calEvent);
        if (isCanCalcuate()) {
          $("#btn_calc").show();
        } else {
          $("#btn_calc").hide();
        }
        $this.$modal.modal("hide");
        return false;
      });
    }),
    (CalendarApp.prototype.enableDrag = function() {
      //init events
      $(this.$event).each(function() {
        // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
        // it doesn't need to have a start or end
        var eventObject = {
          title: $.trim($(this).text()) // use the element's text as the event title
        };
        // store the Event Object in the DOM element so we can get to it later
        $(this).data("eventObject", eventObject);
        // make the event draggable using jQuery UI
        $(this).draggable({
          zIndex: 999,
          revert: true, // will cause the event to go back to its
          revertDuration: 0 //  original position after the drag
        });
      });
    });
  /* Initializing */
  (CalendarApp.prototype.init = function() {
    this.enableDrag();

    var $this = this;
    $this.$calendarObj = $this.$calendar.fullCalendar({
      defaultView: "month",

      handleWindowResize: true,

      header: {
        //left: 'prev,next',
        center: "",
        right: ""
      },
      events: [],
      editable: true,
      droppable: true, // this allows things to be dropped onto the calendar !!!
      eventLimit: true, // allow "more" link when too many events
      selectable: true,
      drop: function(date) {
        $this.onDrop($(this), date);
      },
      // select: function(start, end, allDay) { $this.onSelect(start, end, allDay); },
      eventClick: function(calEvent, jsEvent, view) {
        $this.onEventClick(calEvent, jsEvent, view);
      }
    });
  }),
    (CalendarApp.prototype.reset = function(start_date, end_date) {
      this.enableDrag();

      var $this = this;
      $this.start_date = new Date(start_date).datetoCStr();
      //$this.start_date = new Date(start_date.getFullYear(), start_date.getMonth(), 1);
      var start_date2 = new Date(start_date).datetoCStr2();
      var end_date = new Date(end_date);//alert($this.start_date);alert(start_date2);alert($this.start_date2);
      //$this.end_date = new Date(end_date).datetoCStr();
      $this.end_date = new Date(addDays(end_date, 1)).datetoCStr(); //alert($this.end_date);alert(end_date);
   //   end_date.setDate(end_date.getDate() + 1);
   //   $this.end_date = end_date.datetoendCStr();
      $this.$calendarObj = $this.$calendar.fullCalendar("destroy");
      $this.$calendar.fullCalendar("option", "contentHeight", 200);
      $this.$calendar.fullCalendar("option", "contentWidth", 200);

      $this.$calendarObj = $this.$calendar.fullCalendar({
        defaultView: "month",
        defaultDate: start_date,
        handleWindowResize: true,

        header: {
          //left: "prev,next",
          left: '',
          center: "",
          right: ""
        },
        // events: [{
        //     start: $this.start_date,
        //     end: $this.end_date,
        //     overlap: false,
        //     rendering: 'background',
        // }],
        //showNonCurrentDates:false,
        fixedWeekCount: false,

        //contentHeight:"auto",
        //handleWindowResize:true,
        //themeSystem:'bootstrap3',
        //contentHeight: 1600,
        validRange: {
          start: $this.start_date,
          end: $this.end_date
          //start: "2018-10-01",
          //end: "2018-12-01"
        },
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar !!!
        eventLimit: true, // allow "more" link when too many events
        selectable: true,
        // drop: function (date) { $this.onDrop($(this), date); },
        select: function(start, end, allDay) {
          $this.onSelect(start, end, allDay);
        },
        eventClick: function(calEvent, jsEvent, view) {
          $this.onEventClick(calEvent, jsEvent, view);
        }
      });
    //   $this.$calendarObj = $this.$calendar.fullCalendar("changeView", "month", {
    //     start: "2018-10-01",
    //     end: "2018-12-01"
    //   });
      $this.$calendar.fullCalendar({
        defaultView: 'month',
        duration: { months: 2 }
      });

      // $(".fc-prev-button").click(function(){
      //     // $('#calendar').fullCalendar('prev');
      //     return false;
      // });
      // $(".fc-next-button").click(function(){
      //     // $('#calendar').fullCalendar('next');
      //     return false;
      // });
    }),
    //init CalendarApp
    ($.CalendarApp = new CalendarApp()),
    ($.CalendarApp.Constructor = CalendarApp);
})(window.jQuery),
  //initializing CalendarApp
  $(window).on("load", function() {
    // $.CalendarApp.init()
  });
