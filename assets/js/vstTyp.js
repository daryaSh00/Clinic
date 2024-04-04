var docId = 0;

$(document).ready(function () {
    var varDep;
    var docs;
    var depNum; //The number of departments
    var totalDoc;

    $.post("/Home/getDep")

        .done(function (data) {
            depNum = data.counter;
            varDep = data.dep;

            $("#dep").empty();
            $("#dep").append(
                "<option>" + " دپارتمان " + "</option>");

            for (var item in varDep) {
                $("#dep").append(
                    "<option>" + varDep[item].department + "</option>");
            }

        })
        .fail(function () {

        })
        .always(function () { });

    $("#dep").on('change', function (e) {

        depName = $('#dep').val(); //The name of department selected

        if (depName === "دپارتمان") {
            $(".chbox").prop('disabled', true);
        } else {
            $(".chbox").prop('disabled', false);
        }

        var a = 0;
        if (depName == "دپارتمان") {
            $("#doc").empty();
            $("#doc").append(
                "<option>" + " انتخاب کنید " + "</option>");

            $("#doc").empty();
            $("#doc").append("<option>" + "انتخاب کنید" + "</option>");
        }
        for (let i = 0; i <= depNum; i++) {

            if (depName == varDep[i].department) {
                $.post("/Home/getDoc", { depNum: varDep[i].pkID })

                    .done(function (varDoc) {
                        $("#doc").empty();
                        $("#doc").append(
                            "<option>" + " پزشک مورد نظر را انتخاب کنید " + "</option>");

                        if ($('option:contains("پزشک مورد نظر را انتخاب کنید")').length) {
                            $(".chbox").prop('disabled', true);
                        }
                        else {
                            $(".chbox").prop('disabled', false);
                        }

                        for (var j in varDoc) {
                            $("#doc").append(
                                "<option>" + varDoc[j].name + " " + varDoc[j].family + "</option>");
                        }

                    })
                    .fail(function () {

                    })
                    .always(function () { });
            }
        }
    });

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

    $.post("/Home/getVstPerDoc", { docId: 0 })
        .done(function (res) {

            $("#tblVstTyp").empty();

            for (var item in res.allVstTyp) {
                $("#tblVstTyp").append(
                    "<tr>" +
                    "<td><input class='chbox' type='checkbox' id= 'checkBox_" + res.allVstTyp[item].pkID + "'</td>" +
                    "<td>" + res.allVstTyp[item].type + "</td>" +
                    "<td><input type='number' id='min_" + res.allVstTyp[item].pkID + "'></td>"

                );

            }
        })
        .fail(function () {

        })
        .always(function () { });

    $("#doc").on('change', function (e) {

        for (var i in totalDoc) {

            var nameFamily = totalDoc[i].name + " " + totalDoc[i].family;
            var docName = $('#doc').val();

            if (docName === nameFamily) {
                $.post("/Home/getVstPerDoc", { docId: totalDoc[i].pkID })
                    .done(function (res) {

                        $("#tblVstTyp").empty();
                       
                        for (var item in res.allVstTyp) {
                            $("#tblVstTyp").append(
                                "<tr>" +
                                "<td><input class='chbox' type='checkbox' id= 'checkBox_" + res.allVstTyp[item].pkID + "'</td>" +
                                "<td>" + res.allVstTyp[item].type + "</td>" +
                                "<td><input type='number' id='min_" + res.allVstTyp[item].pkID + "'></td>"

                            );
                        }

                        for (var item in res.vpd) {

                            $("#checkBox_" + res.vpd[item].fkTypeID).prop('checked', true);
                            $("#min_" + res.vpd[item].fkTypeID ).attr('value', res.vpd[item].duration);
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


});

$('table').on('change', '.chbox', function (e) {


    $(this).css("display", "none");

    var val = $(this).attr("id");
    var vstTypId = val.split("_");

    var pass = true;

    var status = $(this).is(':checked');

    var duration = 0;

    var ch = "#min_" + vstTypId[1];
    if (status) {
        if ($(ch).val() == "") {
            swal("لطفا مدت زمان نوبت را وارد کنید.")
            $(ch).css('border-color', 'red');
            $("#" + val).css("display", "block");
            $("#" + val).prop("checked", false);
            pass = false;
        }
        else {
            duration = $(ch).val();
            $("#" + val).css("display", "block");
            $(ch).css('border-color', 'green');
        }
     
    }


    if (pass) {
        $.post("/Home/changeVstTyp", { vstTypId: vstTypId[1], status: status, docId: docId, duration: duration })

            .done(function (res) {
                if (res != "null") {
                    $("#" + val).prop("checked", true);
                    $("#min_" + vstTypId[1]).attr("value", res.duration)
                }
                else {
                    $("#" + val).prop("checked", false);
                    $("#min_" + vstTypId[1]).attr("value", "");
                }
            })
            .fail(function () {
                $("#" + val).prop("checked", !status);
            })
            .always(function () {
                $("#" + val).css("display", "block");
            });
    }

});
