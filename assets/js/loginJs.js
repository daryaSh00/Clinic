$(document).ready(function () {
    $('.message a').click(function () {
        $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
    });
});
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