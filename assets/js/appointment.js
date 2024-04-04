$(document).ready(function () {
   
    $.post("/Home/getAppointment")
        .done(function (res) {
            for (var item in res) {
                $("#tblAppointment").append(
                    "<tr id= 'tr_" + res[item].pkID + "'>"+
                    "<td>" + res[item].pkID + "</td>" +
                    "<td>" + res[item].name + " " + res[item].family + "</td>" +
                    
                    "<td>" + res[item].fSDate + "</td>" +
                    "<td>" + res[item].time + "</td>" +
                    "<td>" + res[item].pName + " " + res[item].pFamily + "</td>" +
                    "<td>" + res[item].pNC + "</td>" +
                    "<td>" + res[item].pMobile + "</td>" +
                    "<td>" + res[item].type + "</td>" +
                    // session 40: bring different status of appointment for receptionist by click
                    "<td class='status' id= status_" + res[item].pkID + " > " + res[item].appointmentStatus + "</td >"+
                    // session 42: add "remove" btn for appointment
                    "<td><button class='btn btn-danger dltBtn' id='remove_" + res[item].pkID + "'>" + "حذف" + "</button></td>"
                );
            }
        })
        .fail(function () {

        })
        .always(function () { });

    // session 40
    $(document).on("click", ".status", function () {

        $("#btnId").html($(this).attr("id")); 
        $.post("/Home/getStatus")

            .done(function (res) {
                $(".modal-body-status").empty();
                for (var item in res) {
                    $(".modal-body-status").append(
                        "<button class='btn btn-info chgStatus'>" + res[item].pkID + " - " + res[item].appointmentStatus + "</button>" +
                        "<br><br>"
                    );
                }
            })
            .fail(function () {

            })
            .always(function () { });

        $("#myModal").modal("show");

    });

    $(document).on("click", ".chgStatus", function () {

        var state = $(this).html().split(" - "); // this is to get the id of status from "<td class='status' id= status_" + res[item].pkID + " > " + res[item].appointmentStatus + "</td >"
        var num = $("#btnId").html().split("_");
        var c = $("#btnId").html();
       
        $.post("/Home/chgStatus", {statusId: state[0], appointmentId: num[1]})
            .done(function (res) { 
                if (res.status == 1) {
                    $("#" + c).html(res.sname);
                }
            })
            .fail(function () {

            })
            .always(function () { });
    });

    // session 42
    $("table").on("click", ".dltBtn", function () {
        var trId = "#" + $(this).closest('tr').attr("id");
        swal({
            title: "هشدار",
            text: "آیا برای پاک کردن این نوبت اطمینان دارید؟",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    var rowId = this.id.split("_");
                    

                    $.post("/Home/removeAppointment", { visitId: rowId[1]})
                        .done(function (res) {
                            if (res) {

                                swal("نوبت حذف شد", {
                                    icon: "success",
                                });

                                $(trId).remove();
                            }
                        })
                        .fail(function () {
                            swal("عملیات ناموفق", {
                                icon: "error",
                            });
                        })
                        .always(function () { });
                }
                else {
                    swal("نوبت شما حذف نشد");
                }
            });
    });
});


var docId = 0;

function addPrmtr() {

    var dateCounter;
    var varDep;
    var docs;
    var depNum; //The number of departments
    var totalDoc;


    $.post("/Home/getDep")

        .done(function (data) {
            depNum = data.counter;
            varDep = data.dep;

            $("#depAdd").empty();
            $("#depAdd").append(
                "<option>" + " دپارتمان " + "</option>");

            for (var item in varDep) {
                $("#depAdd").append(
                    "<option>" + varDep[item].department + "</option>");
            }

        })
        .fail(function () {

        })
        .always(function () { });

    $("#addPrmtr").modal('show');

    // add doctors
    $("#depAdd").on('change', function (e) {

        var depName = $('#depAdd').val(); //The name of department selected
        var a = 0;
        if (depName == "دپارتمان") {
            $("#docAdd").empty();
            $("#docAdd").append(
                "<option>" + " انتخاب کنید " + "</option>");

            $("#visitTypAdd").empty();
            $("#visitTypAdd").append("<option>" + "انتخاب کنید" + "</option>");
        }
        for (let i = 0; i <= depNum; i++) {

            if (depName == varDep[i].department) {
                $.post("/Home/getDoc", { depNum: varDep[i].pkID })

                    .done(function (varDoc) {
                        $("#docAdd").empty();
                        $("#docAdd").append(
                            "<option>" + " پزشک مورد نظر را انتخاب کنید " + "</option>");
                        for (var j in varDoc) {
                            $("#docAdd").append(
                                "<option>" + varDoc[j].name + " " + varDoc[j].family + "</option>");
                        }

                    })
                    .fail(function () {

                    })
                    .always(function () { });
            }
        }
    });

    // total doc
    $.post("/Home/getTotalDoc")
        .done(function (doc) {
            for (var item in doc) {
                totalDoc = doc[item].name + doc[item].family;
                totalDoc = doc;
            }
        })
        .fail(function () {

        })
        .always(function () { });
    //

    // add visit type
    $("#docAdd").on('change', function (e) {

        for (var i in totalDoc) {

            var nameFamily = totalDoc[i].name + " " + totalDoc[i].family;
            var docName = $('#docAdd').val();

            if (docName === nameFamily) {
                $.post("/Home/getVisitType", { docNum: totalDoc[i].pkID })
                    .done(function (res) {

                        $("#visitTypAdd").empty();
                        $("#visitTypAdd").append("<option>" + "انتخاب کنید" + "</option>");

                        for (var item in res) {
                            $("#visitTypAdd").append(
                                "<option>" + res[item].fkTypeID + " - " + res[item].type + "</option>"

                            );

                        }
                    })
                    .fail(function () {

                    })
                    .always(function () { });
                break;
            }
        }

        docId = totalDoc[i].pkID;
    });
    //
    
}



function addAppointment() {

    $("#serverStatus").html(" در حال ارتباط با سرور");
    $("#serverStatus").css("color", "blue");
    $("#btnAddAppointment").html("<i class='fa fa-spinner fa-spin'></i>");
    $("#btnAddAppointment").prop("disabled", true);

    var vstTypId = $("#visitTypAdd").val().split(' - ');

    $.post("/Home/addAppointment", { docPkId: docId, vstTypId: vstTypId, vstTime: $("#addTime").val(), NC: $("#ptintNC").val() })
        .done(function (res) {
            switch (res.status) {
                case 1:
                    $("#serverStatus").html(" نوبت ایجاد شد");
                    $("#serverStatus").css("color", "green");
                    $("#tblAppointment").append(
                        "<tr id= 'tr_" + res.newAppointment.pkID + "'>" +
                        "<td>" + res.newAppointment.pkID + "</td>" +
                        "<td>" + res.newAppointment.name + " " + res.newAppointment.family + "</td>" +
                         
                        "<td>" + res.newAppointment.fSDate + "</td>" +
                        "<td>" + res.newAppointment.time + "</td>" +
                        "<td>" + res.newAppointment.pName + " " + res.newAppointment.pFamily + "</td>" +
                        "<td>" + res.newAppointment.pNC + "</td>" +
                        "<td>" + res.newAppointment.pMobile + "</td>" +
                        "<td>" + res.newAppointment.type + "</td>" +
                        "<td class='status' id= status_" + res.newAppointment.pkID + " > " + res.newAppointment.appointmentStatus + "</td >" +
                        "<td><button class='btn btn-danger dltBtn' id='remove_" + res.newAppointment.pkID + "'>" + "حذف" + "</button></td>"
                    );
                    break;
                case 2:
                    $("#serverStatus").html("کد ملی یافت نشد");
                    $("#serverStatus").css("color", "red");
                    break;
                case 3:
                    $("#serverStatus").html("در این زمان نوبت دکتر پر است");
                    $("#serverStatus").css("color", "red");
                    break;
                case 4:
                    $("#serverStatus").html("در این زمان بیمار نوبت دیگری دارد");
                    $("#serverStatus").css("color", "red");
            }
        })
        .fail(function () {
            $("#serverStatus").html("خطا در برقراری ارتباط با سرور");
            $("#serverStatus").css("color", "red");
        })
        .always(function () {
            $("#btnAddAppointment").html("ثبت نوبت");
            $("#btnAddAppointment").prop("disabled", false);
        });
}