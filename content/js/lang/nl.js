var fdLocale = {
fullMonths:["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"],
monthAbbrs:["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
fullDays:["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"],
dayAbbrs:["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
titles:["Vorige maand", "Volgende maand", "Vorig jaar", "Volgend jaar", "Vandaag", "Toon kalender", "wk", "Week [[%0%]] van [[%1%]]", "Week", "Kies een datum", "Klik en versleep", "Zet \u201C[[%0%]]\u201D vooraan", "Ga naar vandaag", "Geblokkeerde datum"]};
try { 
        if("datePickerController" in window) { 
                datePickerController.loadLanguage(); 
        }; 
} catch(err) {};