using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Paytm;
using System.Net.Mail;

namespace PaytmOne.Controllers
{
    public class PaymentController : Controller
    {
       
        public ActionResult PaymentPage(string Amount,string UserName)
        {


            string shortUrl = ""; string LinkID = ""; string LinkType = ""; string LongURL = ""; string ExpiryDateofURL = "";
            string CreatedDateofURL = ""; string resultStatus = ""; string resultCode = ""; string ResultMessage = "";


            Dictionary<string, string> body = new Dictionary<string, string>();
            Dictionary<string, string> head = new Dictionary<string, string>();
            Dictionary<string, Dictionary<string, string>> requestBody = new Dictionary<string, Dictionary<string, string>>();

            body.Add("mid", "AiPaRa73056566301905");
            body.Add("linkType", "FIXED");
            body.Add("linkDescription", "TestPayment");
            body.Add("linkName", "TestPowershell");
            body.Add("redirectionUrlSuccess", "http://wzccpayment.mastergroups.com/Payment/ResponsePage");
            body.Add("amount", Amount);


            head.Add("tokenType", "AES");

            //  Generate  CheckSum  here  from  Paytm  Library.
            string paytmChecksum = Checksum.generateSignature(JsonConvert.SerializeObject(body), "@Xt98A0WnPSvXzE6");

            head.Add("signature", paytmChecksum);

            requestBody.Add("body", body);
            requestBody.Add("head", head);

            string post_data = JsonConvert.SerializeObject(requestBody);

            //For  Staging  url
            string url = "https://securegw.paytm.in/link/create";

            //For  Production  url
            //string  url  =  "https://securegw.paytm.in/link/create";

            HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(url);

            webRequest.Method = "POST";
            webRequest.ContentType = "application/json";
            webRequest.ContentLength = post_data.Length;

            using (StreamWriter requestWriter = new StreamWriter(webRequest.GetRequestStream()))
            {
                requestWriter.Write(post_data);
            }

            string responseData = string.Empty;

            using (StreamReader responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream()))
            {
                responseData = responseReader.ReadToEnd();
                var createlinkdetails = JObject.Parse(responseData);


                resultStatus = Convert.ToString(createlinkdetails["body"]["resultInfo"]["resultStatus"]);
                resultCode = Convert.ToString(createlinkdetails["body"]["resultInfo"]["resultCode"]);
                ResultMessage = Convert.ToString(createlinkdetails["body"]["resultInfo"]["resultMessage"]);


                shortUrl = Convert.ToString(createlinkdetails["body"]["shortUrl"]);
                LinkID = Convert.ToString(createlinkdetails["body"]["linkId"]);
                LinkType = Convert.ToString(createlinkdetails["body"]["linkType"]);
                LongURL = Convert.ToString(createlinkdetails["body"]["longUrl"]);
                ExpiryDateofURL = Convert.ToString(createlinkdetails["body"]["expiryDate"]);
                CreatedDateofURL = Convert.ToString(createlinkdetails["body"]["createdDate"]);


            }

            Session["sesAmount"] = Amount;
            Session["sesUserName"] = UserName;
            Session["sesLinkID"] = LinkID;

            return Redirect(shortUrl);
            //return Redirect(shortUrl);
            //return Json(new { myurl = Convert.ToString(shortUrl), Status = "Success" }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ResponsePage()
        {
            string ActAmmount = Convert.ToString(Session["sesAmount"]);
            string ActUserName = Convert.ToString(Session["sesUserName"]);
            string ActLinkID = Convert.ToString(Session["sesLinkID"]);

            Dictionary<string, string> body = new Dictionary<string, string>();
            Dictionary<string, string> head = new Dictionary<string, string>();
            Dictionary<string, object> requestBody = new Dictionary<string, object>();

            body.Add("mid", "AiPaRa73056566301905");
            body.Add("linkId", ActLinkID); //659954795  ActLinkID

            head.Add("tokenType", "AES");

            //  Generate  CheckSum  here  from  Paytm  Library.
            string paytmChecksum = Checksum.generateSignature(JsonConvert.SerializeObject(body), "@Xt98A0WnPSvXzE6");

            head.Add("signature", paytmChecksum);

            requestBody.Add("body", body);
            requestBody.Add("head", head);

            string post_data = JsonConvert.SerializeObject(requestBody);

            //For  Staging  url
            string url = "https://securegw.paytm.in/link/fetchTransaction";

            //For  Production  url
            //string  url  =  "https://securegw.paytm.in/link/fetchTransaction";

            HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(url);

            webRequest.Method = "POST";
            webRequest.ContentType = "application/json";
            webRequest.ContentLength = post_data.Length;

            using (StreamWriter requestWriter = new StreamWriter(webRequest.GetRequestStream()))
            {
                requestWriter.Write(post_data);
            }
            string responseData = string.Empty;

            using (StreamReader responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream()))
            {
                responseData = responseReader.ReadToEnd();
                var fetchData = JObject.Parse(responseData);

                SendmailDemo(ActAmmount, ActUserName, Convert.ToString(fetchData["body"]["orders"][0]["orderId"]), Convert.ToString(fetchData["body"]["orders"][0]["orderStatus"]), Convert.ToString(fetchData["body"]["orders"][0]["txnId"]));

                Session["sesAmount"] = null;
                Session["sesUserName"] = null;
                Session["sesLinkID"] = null;

                //Console.WriteLine(responseData);
            }
            return View();
        }

        public void SendmailDemo(string Amt, string Uname, string OID, string status, string txnid)
        {
            DateTime now = DateTime.Now;
            string smtpAddress = "smtp.gmail.com";
            int portNumber = 587;
            bool enableSSL = true;
            string emailFromAddress = "akibgain@gmail.com"; //Sender Email Address  
            string password = "khgp awqp zklj shoi"; //Sender Password  
            string emailToAddress = "shrikant.dharpawar@mastergroups.com,akibgain@gmail.com"; //Receiver Email Address  
            //string subject = "Payment done by +"'Uname ' "+";
            string subject = "Payment done by " + Uname + " of Amount Rs" + Amt;
            string body = "<p>Dear Shrikant,</p><p>Payment of Rs <strong> " + Amt + "  </strong>has been received.</p><p>Below are the details of the payment received :</p>" +
                "<table border='1' cellpadding='1' cellspacing='1' style='width:300px'><tbody><tr><td style='width:126px'><strong>Payment Amount</strong></td>" +
                "<td style='width:158px'><strong> " + Amt + " </strong></td></tr>" +
                 "<tr><td style='width:208px'><strong>Paid By</strong></td><td style='width:286px'><strong> " + Uname + " </strong></td></tr>" +
                 "<tr><td style='width:208px'><strong>Transaction ID</strong></td><td style='width:286px'><strong> " + txnid + " </strong></td></tr>" +
                "<tr><td style='width:208px'><strong>Payment Date</strong></td><td style='width:286px'><strong> " + Convert.ToString(now) + " </strong></td></tr>" +
                "<tr><td style='width:208px'><strong>Status</strong></td><td style='width:286px'><strong> " + status + " </strong></td></tr>" +
                "</tbody></table><p>Regards,<br />Support Team</p>";

            using (MailMessage mail = new MailMessage())
            {
                mail.From = new MailAddress(emailFromAddress);
                mail.To.Add(emailToAddress);
                mail.Subject = subject;
                mail.Body = body;
                mail.IsBodyHtml = true;
                //mail.Attachments.Add(new Attachment("C:\\ReceiptGeneration.pdf"));//--Uncomment this to send any attachment  
                using (SmtpClient smtp = new SmtpClient(smtpAddress, portNumber))
                {
                    smtp.Credentials = new NetworkCredential(emailFromAddress, password);
                    smtp.EnableSsl = enableSSL;
                    smtp.Send(mail);
                }
            }
        }
    }
}
