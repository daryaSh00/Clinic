//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Clinic.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class viewVisitPerDoc
    {
        public int pkID { get; set; }
        public int fkDocID { get; set; }
        public int fkTypeID { get; set; }
        public long duration { get; set; }
        public string type { get; set; }
        public int tblVstTypPkID { get; set; }
    }
}
