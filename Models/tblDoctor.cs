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
    
    public partial class tblDoctor
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public tblDoctor()
        {
            this.tblAppointment = new HashSet<tblAppointment>();
            this.tblVisitPerDoc = new HashSet<tblVisitPerDoc>();
        }
    
        public int pkID { get; set; }
        public string name { get; set; }
        public string family { get; set; }
        public int fkID { get; set; }
        public Nullable<int> personalNum { get; set; }
        public string pass { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblAppointment> tblAppointment { get; set; }
        public virtual tblDepartment tblDepartment { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblVisitPerDoc> tblVisitPerDoc { get; set; }
    }
}
