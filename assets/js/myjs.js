var dateCounter;

$(document).ready(function () {
    var varDep;
    var docs;
    var depNum; //The number of departments
    var totalDoc;
    


    $.post("/Home/getDep")

        .done(function (data) {
            depNum = data.counter;
            varDep = data.dep;

            for (var item in varDep) {
                $("#department").append(
                    "<option>" + varDep[item].department + "</option>");

            }

        })
        .fail(function () {

        })
        .always(function () { });


    $.post("/Home/getTotalDoc")
        .done(function (doc) {
            for (var item in doc) {
                totalDoc = doc[item].name + doc[item].family;
                totalDoc = doc;
            }
            console.log(totalDoc);
        })
        .fail(function () {

        })
        .always(function () { });


    $('#department').on('change', function (e) {   //
        var depName = $('#department').val(); //The name of department selected

        for (let i = 0; i <= depNum; i++) {

            if (depName == varDep[i].department) {
                $.post("/Home/getDoc", { depNum: varDep[i].pkID })

                    .done(function (varDoc) {
                        $("#doctor").empty();
                        $("#doctor").append(
                            "<option>" + " انتخاب کنید " + "</option>");
                        for (var j in varDoc) {
                            $("#doctor").append(
                                "<option>" + varDoc[j].name + " " + varDoc[j].family + "</option>");
                        }
                    })
                    .fail(function () {

                    })
                    .always(function () { });
            }
        }
    });  //



    $('#doctor').on('change', function (e) {   //
        var docName = $('#doctor').val(); //The name of doctor selected

        for (var i in totalDoc) {
            var nameFamily = totalDoc[i].name + " " + totalDoc[i].family;

            if (docName === nameFamily) {

                $.post("/Home/getTime", { docNum: totalDoc[i].pkID })

                    .done(function (varDate) {
                        $("#date").empty();
                        $("#date").append(
                            "<option>" + "انتخاب کنید" + "</option>");
                        var j = 0;
                        dateCounter = 0;
                        for (j in varDate) {

                            $("#date").append(
                                "<option>" + varDate[j].pkID + "-" + varDate[j].fSDate + " Time: " + varDate[j].time + "</option>");
                            dateCounter++;
                        }

                    })
                    .fail(function () {

                    })
                    .always(function () {

                    });
            }
        }

    });  //

    // start: Focus name to remove the error
    $("#name").focus(function () {
        document.getElementById("nVal").innerHTML = "";
    });
    //finish

    

    $("#family").focus(function () {
        document.getElementById("fVal").innerHTML = "";
    });

    

    $("#phone").focus(function () {
        document.getElementById("phVal").innerHTML = "";
    });

    

    $("#date").focus(function () {
        document.getElementById("dVal").innerHTML = "";
    });

    // instead of all these:
    /* $("#date").blur(function () {
        validation();
    });
    $("#phone").blur(function () {
        validation();
    });
    $("#family").blur(function () {
        validation();
    });
    $("#name").blur(function () {
        validation();
    }); */
    // use this: 
    $(".valid-me").blur(function () {
        validation(this.id);
    });

});

function validation(res) {
    var valid = true;

    var pName = $("#name").val();
    var pFamily = $("#family").val();
    var phone = $("#phone").val();

    switch (res) {
        case "name":

            if (pName.length > 20 || pName.length < 3) {
                valid = false;
                document.getElementById("nVal").innerHTML = "نام باید بین 3 تا 20 کاراکتر باشد"
            }
            break;

        case "family":
            if (pFamily.length > 30 || pFamily.length < 3) {
                valid = false;
                document.getElementById("fVal").innerHTML = "نام خانوادگی باید بین 3 تا 20 کاراکتر باشد"
            }
            break;

        case "phone":
            var digit = /^\d+$/;
            if (!digit.test(phone)) {
                //console.error("Error: Variable contains non-digit characters!");
                document.getElementById("phVal").innerHTML = "شماره تلفن باید فقط شامل اعداد باشد";
                valid = false;
            } else {
                //console.log("Variable contains only digits.");
                if (phone.length != 11) {
                    document.getElementById("phVal").innerHTML = "شماره موبایل باید 11 رقم باشد";
                    valid = false;
                }
            }
            break;
            alert(dateCounter);
        case "date":
            var ch = $("#date").val();
            if (ch == "انتخاب کنید" && dateCounter > 0) {
                valid = false;
                $("#dVal").html(" از منو بالا یک نوبت انتخاب کنید.");
            }
            break;
    }

    if (!valid) {
        $('#' + res).addClass("inputerror");
    }
    else {
        $('#' + res).removeClass("inputerror");
        $('#' + res).addClass("inputcorrect");
    }

    return valid;
}

function setAppointment() {
    var value = $('#date').val();
    var id = value.split("-", 1);
    var pName = $("#name").val();
    var phone = $("#phone").val();
    var pFamily = $("#family").val();

    /// validation ///

    /*var valid = true;
    
    if (pName.length > 20 || pName.length < 3) {
        valid = false;
        document.getElementById("nVal").innerHTML = "نام باید بین 3 تا 20 کاراکتر باشد";
       // $("#nVal").html("نام باید بین 3 تا 20 کاراکتر باشد");
    }*/

    var valName = validation("name");
    var valFamily = validation("family");
    var valPhone = validation("phone");
    var valDate = validation("date");

    if (valDate && valPhone && valFamily && valName) {
        
        $.post("/Home/setAppointment", { value: id, pName: pName, pFamily: pFamily, phone: phone })
            .done(function (res) {
                switch (res) {
                    case 1: swal("عملیات موفق", "نوبت شما با موفقیت ثبت شد", "success")
                        break;
                    case 2: alert("این نوبت رززو شده است")
                        break;
                }

            })
            .fail(function () {
                alert("خطا");
            })
            .always(function () { });
    }

    else {
        swal("عملیات ناموفق", "لطفا خطاهای ورودی را تصحیح کنید", "error");
    }
}

function login() {
    var personalNumJs = $("#personalNumHtml").val();
    var passJs = $("#passHtml").val();

    $.post("/Home/loginCheck", { personalNumController: personalNumJs, passController: passJs })
        .done(function (res) {
            switch (res) {
                case 1: swal("عملیات موفق", "شما با موفقیت وارد شدید", "success");
                    window.location.href = "recept";
                    break;
                case 2: swal("عملیات ناموفق", "لطفا رمز را درست وارد کنید", "error")
                    break;
                case 3: swal("عملیات ناموفق", "چنین کاربری با این شماره وجود ندارد", "error")
            }
        })
        .fail(function () {

        })
        .always(function () { });
}