using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Clinic.Models;
using System.Text;
using System.Web.Security;
using System.Globalization;
using System.Threading;

namespace Clinic.Controllers
{
    public class HomeController : Controller
    {
        hdata context = new hdata();

        public ActionResult Index()
        {
            int doctors = context.tblDoctor.Count();
            int departments = context.tblDepartment.Count();
            ViewBag.doc = doctors;
            ViewBag.dep = departments;

            string lang = deflang();

            /*session 50*/
            var res = context.viewChangeLng.ToList();
            ViewBag.title = res.Where(x => x.name == "تیتر اصلی" && x.language == lang).Select(x => x.itmContent).SingleOrDefault();
            /*step 3: session 51*/
            ViewBag.bannerimg = res.Where(x => x.pkID == 2).Select(x => x.itmContent).SingleOrDefault();

            return View();     
        }

        /* session 57: change language */
        public ActionResult chlang(string lang)
        {
            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(lang);
            Thread.CurrentThread.CurrentUICulture = new CultureInfo(lang);
            Response.Cookies["lang"].Value = lang;
            Response.Cookies["lang"].Expires = DateTime.Now.AddDays(500);
            return RedirectToAction("Index");
        }

        public ActionResult getDep()
        {
            var dep = context.tblDepartment.Where(x => x.pkID != 7).Select(x => new { x.pkID, x.department }).ToList();
            int counter = context.tblDepartment.Count();
            var data = new { dep, counter };
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getTotalDoc()
        {
            var doc = context.tblDoctor.Select(x => new { x.pkID, x.name, x.family }).ToList();
            return Json(doc, JsonRequestBehavior.AllowGet);
        }

       
        public ActionResult getDoc(int depNum)
        {
            var doc = context.tblDoctor.Where(x => x.fkID == depNum).Select(x => new { x.fkID, x.name, x.family }).ToList();
            return Json(doc, JsonRequestBehavior.AllowGet);
        }

        
        public ActionResult getTime(int docNum)
        {
            var date = context.viewAppointment.Where(x => x.fkDocID == docNum && x.fkPID == null).Select(x => new { x.pkID, x.fSDate, x.time }).ToList();
            return Json(date, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getVisitType(int docNum)
        {
            var visitTyp = context.viewVisitPerDoc.Where(x => x.fkDocID == docNum).Select(x => new { x.fkTypeID, x.type }).ToList();
            return Json(visitTyp, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getVstPerDoc(int docId)
        {
            var allVstTyp = context.tblVisitType.Select(x => new { x.pkID, x.type }).ToList();
            var vpd = context.viewVisitPerDoc.Where(x => x.fkDocID == docId).ToList();
            return Json(new { allVstTyp = allVstTyp, vpd = vpd }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult changeVstTyp(int vstTypId, bool status, int docId, int duration)
        {
            if (status)
            {
                tblVisitPerDoc add = new tblVisitPerDoc();
                add.fkDocID = docId;
                add.fkTypeID = vstTypId;
                add.duration = duration;
                context.tblVisitPerDoc.Add(add);
                context.SaveChanges();

            }

            else
            {
                var ch = context.tblVisitPerDoc.Where(x => x.fkDocID == docId && x.fkTypeID == vstTypId).Single();
                context.tblVisitPerDoc.Remove(ch);
                context.SaveChanges();
            }

            var res = context.tblVisitPerDoc.Where(x => x.fkDocID == docId && x.fkTypeID == vstTypId).Select(x => new { x.fkDocID, x.fkTypeID, x.duration }).SingleOrDefault();

            if (res == null)
            {
                return Json("null", JsonRequestBehavior.AllowGet);
            }

            else
            {
                return Json(res, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult setAppointment(int value, string pName, string pFamily, string phone)
        {
            int status = 0;
            var ch = context.tblAppointment.Where(x => x.pkID == value).SingleOrDefault();
            if (ch.fkPID == null)
            {
                int pID = 0;
                var patient = context.tblPatient.Where(x => x.mobile == phone).SingleOrDefault();
                if (patient == null)
                {
                    tblPatient newPatient = new tblPatient();
                    newPatient.name = pName;
                    newPatient.family = pFamily;
                    newPatient.mobile = phone;

                    context.tblPatient.Add(newPatient);
                    context.SaveChanges();
                    var nPatient = context.tblPatient.Where(x => x.mobile == phone).SingleOrDefault();
                    pID = nPatient.pkID;
                }

                else
                {
                    pID = patient.pkID;
                } 

                var add = context.tblAppointment.Where(x => x.pkID == value).SingleOrDefault();
                add.fkPID = pID;
                add.fkVTID = 1;
                add.eDate = add.sDate.AddMinutes(20);
                context.SaveChanges();
                status = 1;
            }
            else
            {
                status = 2;
            }

           
            return Json(status, JsonRequestBehavior.AllowGet);
        }

        // section 35: control panel
        public ActionResult recept()
        {
            ViewBag.title = Clinic.Resource.resMenu.menuDashboard;
            return View();
        }
        //

        // section 35: appointment managment
        public ActionResult appointmentManage()
        {
            ViewBag.title = Clinic.Resource.resMenu.menuAppointment;
            return View();
        }
        //

        public ActionResult vstTyp()
        {
            ViewBag.title = Clinic.Resource.resMenu.menuVstTyp;
            return View();
        }

        // section 36: login
        public ActionResult login()
        {
            return View();
        }

        public ActionResult loginCheck(int personalNumController, string passController)
        {
            int status = 0;
            var user = context.tblDoctor.Where(x => x.personalNum == personalNumController).SingleOrDefault();
            if(user!= null)
            {
               if(user.pass == passController)
                {
                    //Session["userId"] = user.pkID; // *** look at this line, in session 37 we rewrite this with cookies, thus we have to hide this line ***

                    // session 38: Encrypt cookies
                    var cookieText = Encoding.UTF8.GetBytes(user.pkID.ToString()); // here you should write the text that you want to store as a sooky which is the user pkId
                    var encryptedValue = Convert.ToBase64String(MachineKey.Protect(cookieText, "ProtectCookie-coreKey")); // look at "ProtectCookie-coreKey" this text can be any thing you want, it functions as a key to encrypt the top variable which is cookieText and you should send this variable to Response.Cookies instead of user.pkID.ToString()
                    // session 37
                    Response.Cookies["userId"].Value = encryptedValue;
                    Response.Cookies["userId"].Expires = DateTime.Now.AddDays(10);
                    //
                    status = 1; //correct pass
                }
                else
                {
                    status = 2; //wrong pass
                }
            }
            else
            {
                status = 3; // username does not exist or is wrong
            }

            return Json(status, JsonRequestBehavior.AllowGet);
        }
        //

        // session 37
        public void logout()
        {
            Response.Cookies["userId"].Expires = DateTime.Now.AddDays(-1); // This is to disable cookies after clicking on exit btn in control panel
            Session.Abandon();
            Response.Redirect("/Home/Index");
           
        }
        //

        // session 38
        public void setName()
        {
            // session 38: Decrypt cookies
            var bytes = Convert.FromBase64String(Request.Cookies["userId"].Value);
            var output = MachineKey.Unprotect(bytes, "ProtectCookie-coreKey");
            string result = Encoding.UTF8.GetString(output);
            //
            int userId = int.Parse(result); // instead of 'Request.Cookies["userId"].Value' in 'int.Parse(Request.Cookies["userId"].Value);' we rewrite the current code
            var user = context.tblDoctor.Where(x => x.pkID == userId).SingleOrDefault();
            Session["username"] = user.name + " " + user.family;
        }
        //

        // session 39
        public ActionResult getAppointment()
        {
            var appointment = context.viewAppointment.OrderBy(x => x.sDate).ToList();
            return Json(appointment, JsonRequestBehavior.AllowGet);
        }
        //

        // session 40
        public ActionResult getStatus()
        {
            var status = context.tblAppointmentStatus.Select(x => new { x.pkID, x.appointmentStatus }).ToList();
            return Json(status, JsonRequestBehavior.AllowGet);
        }

        public ActionResult chgStatus(int statusId, int appointmentId)
        {
            int status = 0;
            string sname = "";
            var appointment = context.tblAppointment.Where(x => x.pkID == appointmentId).SingleOrDefault();
            if (appointment != null)
            {
                appointment.fkAppointmentStatus = statusId;
                context.SaveChanges();
                status = 1;
                sname = context.tblAppointmentStatus.Where(x => x.pkID == statusId).Select(x => x.appointmentStatus).SingleOrDefault();
            }
            return Json(new { status= status, sname = sname }, JsonRequestBehavior.AllowGet);
        }
        //

        //session 42: remove appointment and add appointment
        
        public ActionResult removeAppointment(int visitId)
        {
            
            var appointment = context.tblAppointment.Where(x => x.pkID == visitId).SingleOrDefault();
            context.tblAppointment.Remove(appointment);
            context.SaveChanges();
            return Json(true, JsonRequestBehavior.AllowGet);
        }
        //

        // session 42: add appointment by receptionist
        public ActionResult addAppointment(int docPkId, int vstTypId, string vstTime, string NC)
        {
            int ptintId = 0;

            if (NC != "")
            {
                var ptint = context.tblPatient.Where(x => x.nationalCode == NC).SingleOrDefault();
                if (ptint == null)
                {
                    return Json(new { status = 2, newAppointment = 0 }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    ptintId = ptint.pkID;
                }
            }
            

            string[] dateTime = vstTime.Split(' ');
            string[] date = dateTime[0].Split('/');
            string[] time = dateTime[1].Split(':'); 

            int y = MyExtensions.PersianToEnglish(date[0]);
            int m = MyExtensions.PersianToEnglish(date[1]);
            int d = MyExtensions.PersianToEnglish(date[2]);
            int h = MyExtensions.PersianToEnglish(time[0]);
            int min = MyExtensions.PersianToEnglish(time[1]);

            PersianCalendar prsinCal = new PersianCalendar();
            DateTime t = prsinCal.ToDateTime(y, m, d, h, min, 0, 0);

            double duration = context.viewVisitPerDoc.Where(x => x.fkDocID == docPkId && x.fkTypeID == vstTypId).Select(x => x.duration).Single();

            // session 43: Detect overlaped appointment and time for both doctors and patient
            var overlapDoc = context.tblAppointment.Where(x => x.fkDocID == docPkId && x.sDate <= t && x.eDate > t).ToList();
            if (overlapDoc.Count != 0)
            {
                return Json(new { status = 3, newAppointment = 0 }, JsonRequestBehavior.AllowGet);
            }

            if(ptintId > 0)
            {
                var overLapPtint = context.tblAppointment.Where(x => x.fkPID == ptintId && x.sDate <= t && x.eDate > t).ToList();
                if (overLapPtint.Count != 0)
                {
                    return Json(new { status = 4, newAppointment = 0 }, JsonRequestBehavior.AllowGet);
                }
            }
            //

            tblAppointment newAppointment = new tblAppointment();
            newAppointment.fkDocID = docPkId;
            newAppointment.sDate = t;
            newAppointment.eDate = t.AddMinutes(duration);
            newAppointment.fkVTID = vstTypId;
            newAppointment.fkAppointmentStatus = 1;
            if (NC == "")
            {
                newAppointment.fkPID = null;
            }
            else
            {
                newAppointment.fkPID = ptintId;
            }

            context.tblAppointment.Add(newAppointment);
            context.SaveChanges();

            var thisAppointment = context.viewAppointment.Where(x => x.fkDocID == docPkId && x.sDate == newAppointment.sDate && x.eDate == newAppointment.eDate).SingleOrDefault();
            return Json(new { status = 1, newAppointment = thisAppointment }, JsonRequestBehavior.AllowGet);
        }
        //

        public string deflang()
        {
            if (Request.Cookies["lang"] != null)
            {
                if (Request.Cookies["lang"].Value != null)
                {
                    return Request.Cookies["lang"].Value;
                }
                else
                {
                    return "fa";
                }
            }
            else
            {
                return "fa";
            }

        }
    }

    public static class MyExtensions
    {
        public static int PersianToEnglish(this string persianStr)
        {
            Dictionary<char, char> LettersDictionary = new Dictionary<char, char>
            {
                ['۰'] = '0',
                ['۱'] = '1',
                ['۲'] = '2',
                ['۳'] = '3',
                ['۴'] = '4',
                ['۵'] = '5',
                ['۶'] = '6',
                ['۷'] = '7',
                ['۸'] = '8',
                ['۹'] = '9',
                ['0'] = '0',
                ['1'] = '1',
                ['2'] = '2',
                ['3'] = '3',
                ['4'] = '4',
                ['5'] = '5',
                ['6'] = '6',
                ['7'] = '7',
                ['8'] = '8',
                ['9'] = '9'


            };
            foreach (var item in persianStr)
            {
                persianStr = persianStr.Replace(item, LettersDictionary[item]);
            }
            return int.Parse(persianStr);
        }
    }

}