// init operation
initSubjectList();
initScheduleList();
bindEvents();

/********* DOM util method start *********/
function getSearchSubjectDom() {
    return document.getElementById("time-search-subject");
}

function getSearchSubject() {
    return getSearchSubjectDom().value;
}

function getSearchCourseDom() {
    return document.getElementById("time-search-course");
}

function getSearchCourse() {
    return getSearchCourseDom().value;
}

function getSearchScheduleDom() {
    return document.getElementById("schedule-search-name")
}

function getSearchSchedule() {
    return getSearchScheduleDom().value;
}

function getAddScheduleDom() {
    return document.getElementById("schedule-add-name")
}

function getAddSchedule() {
    return getAddScheduleDom().value;
}

function getCourseOperationDom() {
    return document.getElementById("course-operation");
}

function buildOption(code, text) {
    var option = document.createElement("option");
    var displayText = text || code;
    option.value = code;
    option.text = displayText;
    return option;
}

/********* DOM util method end *********/

/********* fetch wrapper start *********/
function doGet(url = '', okCallback, failCallback) {
    fetch(url).then(res => {
        if (res.ok) {
            res.json().then(data => {
                okCallback && okCallback(data);
            })
        } else {
            console.log('Error: ', res.status);
            failCallback && failCallback(res);
        }
    });
}

function doDelete(url = '', okCallback, failCallback) {
    fetch(url, {
        method: 'DELETE',
    }).then(res => fetchHandler(res, okCallback, failCallback));
}

function doPost(url = '', data = {}, okCallback, failCallback) {
    updateHelper('POST', url, data, okCallback, failCallback);
}

function doPut(url = '', data = {}, okCallback, failCallback) {
    updateHelper('PUT', url, data, okCallback, failCallback);
}

function updateHelper(method, url = '', data = {}, okCallback, failCallback) {
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => fetchHandler(res, okCallback, failCallback));
}

function fetchHandler(res, okCallback, failCallback) {
    if (res.ok) {
        okCallback && okCallback(res);
    } else {
        console.log('Error: ', res.status);
        failCallback && failCallback(res);
    }
}
/********* fetch wrapper end *********/

function bindEvents() {
    getSearchSubjectDom().addEventListener("change", subjectChangedCallback);
    document.getElementById("search-time-table").addEventListener("click", searchTimeTable);
    document.getElementById("add-course-to-schedule").addEventListener("click", addSelectCoursesToSchedule);
    getSearchScheduleDom().addEventListener("change", showSchedule);
    document.getElementById("btn-show-detail").addEventListener("click", showSchedule);
    document.getElementById("btn-delete-schedule").addEventListener("click", deleteSchedule);
    document.getElementById("btn-new-schedule").addEventListener("click", addNewSchedule);
    document.getElementById("btn-delete-all-schedule").addEventListener("click", deleteAllSchedule);
}

var htmlTimeTable =
    '\
<table class="table table-striped">\
    <thead>\
        <tr>\
            <th width="2%">#</th>\
            <th width="8%">Course Code</th>\
            <th width="15%">Course Title</th>\
            <th width="8%">Component</th>\
            <th width="10%">Days</th>\
            <th width="8%">Start Time</th>\
            <th width="8%">End Time</th>\
        </tr>\
    </thead>\
<tbody>{table-body}</tbody>\
</table>';
var htmlTableRow =
    '<tr>\
        {selection}\
        {course-code}\
        {course-title}\
        <td class="{comp-index}">{component}</td>\
        <td class="{comp-index}">\
            <table class="daysTable">\
                <tbody><tr>\
                    <td width="10%">{day-1}</td>\
                    <td width="10%">{day-2}</td>\
                    <td width="10%">{day-3}</td>\
                    <td width="10%">{day-4}</td>\
                    <td width="10%">{day-5}</td>\
                </tr>\
            </tbody></table>\
          </td>\
        <td class="{comp-index}">{start-time}</td>\
        <td class="{comp-index}">{end-time}</td>\
    </tr>';
var htmlRowSpan = '<td rowspan="{count}">{value}</td>';
var htmlRowNormal = "<td>{value}</td>";
var htmlEmptyData = '<tr><td colspan="{col-num}">No Data</td></tr>';

function isEmpty(obj) {
    // refs: https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function buildTableHtml(data, htmlColSel) {
    var tableBody = buildTableBody(data, htmlColSel);
    return htmlTimeTable.replace(/{table-body}/g, tableBody);
}

function buildTableBody(data, htmlColSel) {
    var tableBody = "";
    data.forEach(c => {
        if (!c || !c.components) return;
        var nComp = c.components.length;
        var courseCodeCol, courseTitleCol, selectionCol;

        if (nComp > 1) {
            courseCodeCol = htmlRowSpan
                .replace(/{count}/, nComp)
                .replace(/{value}/, c.course);
            courseTitleCol = htmlRowSpan
                .replace(/{count}/, nComp)
                .replace(/{value}/, c.className);
            selectionCol = htmlRowSpan
                .replace(/{count}/, nComp)
                .replace(/{value}/, htmlColSel.replace(/{name}/, c.course)
                    .replace(/{subject}/, c.subject)
                    .replace(/{course}/, c.course)
                );
        } else {
            courseCodeCol = htmlRowNormal.replace(/{value}/, c.course);
            courseTitleCol = htmlRowNormal.replace(/{value}/, c.className);
            selectionCol = htmlRowNormal.replace(/{value}/,
                htmlColSel.replace(/{name}/, c.course)
                .replace(/{subject}/, c.subject)
                .replace(/{course}/, c.course)
            );
        }

        for (var j = 0; j < nComp; ++j) {
            var row = htmlTableRow.replace(/{component}/g, c.components[j].component)
                .replace(/{start-time}/g, c.components[j].startTime)
                .replace(/{end-time}/g, c.components[j].endTime)
                .replace(/{comp-index}/g, "comp-" + c.components[j].component);
            if (j == 0) {
                row = row.replace(/{course-code}/g, courseCodeCol)
                    .replace(/{course-title}/g, courseTitleCol)
                    .replace(/{selection}/g, selectionCol);
            } else {
                row = row.replace(/{course-code}/g, "")
                    .replace(/{course-title}/g, "")
                    .replace(/{selection}/g, "");
            }

            var days = new Set(c.components[j].days),
                allDay = ["M", "Tu", "W", "Th", "F"];

            allDay.forEach((val, idx) => {
                var res = days.has(val) ? val : "&nbsp;";
                row = row.replace("{day-" + (idx + 1) + "}", res);
            })
            tableBody += row;
        }
    });
    if (!tableBody)
        tableBody = htmlEmptyData.replace(/{col-num}/, 7);
    return tableBody;
}

function searchTimeTable() {
    var subject = getSearchSubject();
    if (!subject) {
        alert("subject should not be empty!");
        return;
    }

    var course = getSearchCourse();
    var url = "/api/timetables?subject=" + subject;

    if (course !== 'all') {
        var component = document.getElementById("time-search-component").value;
        if (component !== 'all') {
            url = "/api/timetables?subject=" + subject + "&course=" + course +
                "&component=" + component;
        } else {
            url = "/api/timetables?subject=" + subject + "&course=" + course;
        }
    }
    doGet(url, function(data) {
        if (!Array.isArray(data)) data = [data];
        var htmlColSel = '<input type="checkbox" class="course-selection" name="{name}" subject="{subject}" course="{course}">';
        var domResult = document.getElementById("time-table");
        domResult.innerHTML = buildTableHtml(data, htmlColSel);
        if (data.length === 0 || isEmpty(data[0])) {
            getCourseOperationDom().style.display = 'none';
        } else {
            getCourseOperationDom().style.display = 'block';
        }
    });
}

function subjectChangedCallback() {
    // change the course combobox
    var subject = getSearchSubject();
    var domCourse = getSearchCourseDom();
    domCourse.innerHTML = "";
    domCourse.add(buildOption("all", "All"));
    doGet("/api/subjects/" + subject + "/courses", function(data) {
        data.forEach(e => domCourse.add(buildOption(e.code)));
    });
}

function showSchedule() {
    var schedule = getSearchSchedule();
    if (!schedule) {
        alert("Schedule should not be empty!");
        return;
    }
    doGet("/api/schedules/" + schedule, function(data) {
        var htmlColSel = '<input type="checkbox" name="{name}" />';
        var domResult = document.getElementById("schedule-table");
        domResult.innerHTML = buildTableHtml(data.courses, htmlColSel);
    });
}

function addNewSchedule() {
    var name = prompt("Please enter the new schedule name", "");
    if (!name) {
        alert("Invalid schedule name");
        return;
    }

    doPost("/api/schedules/" + name, {}, function() {
        alert("Success to create the schedule!");
        initScheduleList();
    }, function() {
        alert("Failed to create the schedule!");
    });
}

function deleteSchedule() {
    var name = getSearchSchedule();
    if (!name) {
        alert("Please select a schedule first!");
        return;
    }
    if (!confirm('Are you sure to delete schedule: ' + name + '?')) {
        return;
    }
    doDelete("/api/schedules/" + name, initScheduleList);
}

function deleteAllSchedule() {
    if (!confirm('Are you sure to delete all schedules?')) {
        return;
    }
    doDelete("/api/schedules/", initScheduleList);
}

function addSelectCoursesToSchedule() {
    // get selected courses
    var checkboxs = document.getElementsByClassName('course-selection');
    var data = [];
    Array.from(checkboxs).forEach(e => {
        if (!e.checked) return;
        var subject = e.attributes['subject'].value;
        var course = e.attributes['course'].value;
        data.push({ 'subject': subject, 'course': course });
        e.checked = false;
    });
    if (data.length === 0) {
        alert("Please select the course at first!");
        return;
    }

    var schedule = getAddSchedule();
    if (!schedule) {
        alert("Please select a schedule first!");
        return;
    }

    doPut("/api/schedules/" + schedule, data, function() {
        alert("Success to update the schedule!");
        Array.from(checkboxs).forEach(e => e.checked = false);
        initScheduleList();
        if (getSearchSchedule() === schedule) {
            showSchedule();
        }
    });
}

function initSubjectList() {
    doGet("/api/subjects", function(data) {
        var domSubject = getSearchSubjectDom();
        data.map(x => x.subject)
            .forEach(e => domSubject.add(buildOption(e)));
        subjectChangedCallback();
    });
}

function initScheduleList() {
    doGet("/api/schedules", function(data) {
        var domScheduleForSearch = getSearchScheduleDom();
        var domScheduleForAdd = getAddScheduleDom();

        domScheduleForSearch.innerHTML = "";
        domScheduleForAdd.innerHTML = "";
        data.map(e => e.name)
            .forEach(e => {
                domScheduleForSearch.add(buildOption(e));
                domScheduleForAdd.add(buildOption(e));
            });
    });
}