const electron = require('electron')
const remote = require('electron').remote
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios')
const ipc = electron.ipcRenderer
const vCard = require('vcf')

var tableBodyInfo = document.getElementById('tbody-info')

//Copy fields
var copyFN = document.getElementById('copyFN')
var copyEMAIL = document.getElementById('copyEMAIL')
var copyTEL = document.getElementById('copyTEL')
var copyADR = document.getElementById('copyADR')
var copyNOTES = document.getElementById('copyNOTES')
var copyDOB = document.getElementById('copyDOB')
var copyMsg = document.getElementById('copyMsg')
//END COPY FIELDS

//COPY LOGIC
copyFN.addEventListener('click', (e) => {
    if (document.getElementById('FN') !== '') {
        electron.clipboard.writeText(document.getElementById('FN').textContent, 'text');
        copyMsg.innerHTML = "Copied Full Name to clipboard";
        copyMsg.classList.remove("hidden");
    }
});
copyEMAIL.addEventListener('click', (e) => {
    if (document.getElementById('EMAIL') !== '') {
        electron.clipboard.writeText(document.getElementById('EMAIL').textContent, 'text');
        copyMsg.innerHTML = "Copied Email to clipboard";
        copyMsg.classList.remove("hidden");
    }
});
copyTEL.addEventListener('click', (e) => {
    if (document.getElementById('TEL') !== '') {
        electron.clipboard.writeText(document.getElementById('TEL').textContent, 'text');
        copyMsg.innerHTML = "Copied Phone to clipboard";
        copyMsg.classList.remove("hidden");
    }
});
copyADR.addEventListener('click', (e) => {
    if (document.getElementById('ADR') !== '') {
        electron.clipboard.writeText(document.getElementById('ADR').textContent, 'text');
        copyMsg.innerHTML = "Copied Address to clipboard";
        copyMsg.classList.remove("hidden");
    }
});
copyNOTES.addEventListener('click', (e) => {
    if (document.getElementById('NOTES') !== '') {
        electron.clipboard.writeText(document.getElementById('NOTES').textContent, 'text');
        copyMsg.innerHTML = "Copied Notes to clipboard";
        copyMsg.classList.remove("hidden");
    }
});
copyDOB.addEventListener('click', (e) => {
    if (document.getElementById('DOB') !== '') {
        electron.clipboard.writeText(document.getElementById('DOB').textContent, 'text');
        copyMsg.innerHTML = "Copied DOB to clipboard";
        copyMsg.classList.remove("hidden");
    }
});
//END OF COPY LOGIC

ipc.on('targetPriceVal', (e, arg) => {
    targetPriceVal = Number(arg);
    targetPrice.innerHTML = '$' + targetPriceVal.toLocaleString('en');
});


// OPEN VCF FILE
var fs = require('fs');
const dialog = remote.dialog;

function openFile() {

    dialog.showOpenDialog({
        filters: [
            { name: 'vCard', extensions: ['vcf'] }
        ]
    }, function (fileNames) {
        copyMsg.innerHTML = "";
        copyMsg.classList.add("hidden");

        if (fileNames === undefined) return;

        var fileName = fileNames[0];
        readVCardInfo(fileName);
    });
}
// END OF OPEN VCF FILE EVENT

(function () {
    var holder = document.getElementById('drag-file');

    holder.ondragover = () => {
        return false;
    };

    holder.ondragleave = () => {
        return false;
    };

    holder.ondragend = () => {
        return false;
    };

    holder.ondrop = (e) => {
        e.preventDefault();

        for (let f of e.dataTransfer.files) {
            var fileName = f.path;
            copyMsg.innerHTML = "";
            copyMsg.classList.add('hidden');
            console.log(fileName);
            readVCardInfo(fileName);
        }

        return false;
    };
})();


// Handle change 
function handleString(input) {
    const allLines = input.split(/\r\n|\n/);
    var lines = [];
    var slug = "";
    var additionalInfo = [];
    var finalString = "";

    // Reading line by line
    allLines.map((line) => {
        if (line.indexOf('item') !== -1) {
            lines.push(line);
        }
    });
    lines.sort()
    if (lines.length > 2) {
        for (var i = 2; i < lines.length; i++) {

            console.log("supposed to push item" + i)
            additionalInfo.push(lines[i]);

        }
        console.log(additionalInfo.sort())
        if (additionalInfo.length > 2) {


            for (var i = 0; i < additionalInfo.length; i++) {
                if (additionalInfo[i].includes('X-APPLE-OMIT-YEAR')) {
                    additionalInfo.splice(i);
                    i--;
                }

                var str = additionalInfo[i];
                console.debug(str);
                if (str.includes("_$!<")) {
                    str = str.replace('_$!<', '').replace('>!$_', '');
                }
                slug += str.split(':').pop();
                slug += "\n";
            }

            slug = slug.split("\n");
            console.log(slug);

            for (var i = 0; i < slug.length; i++) {
                if (slug[i + 1] === undefined) {
                    break;
                }
                finalString += slug[i] + ": " + slug[i + 1] + '<br>';
                i++;
            }
            console.log(finalString);
        }

    }

    return finalString.toString();
}

//Reads all the info from the actual vCard file
function readVCardInfo(fileName) {
    var tableInfo = ``;
    fs.readFile(fileName, 'utf-8', function (err, data) {
        data = data.substring(0, data.indexOf('END:VCARD') + 'END:VCARD'.length)
        var card = new vCard().parse(data);

        if (card.data.adr !== undefined) {
            var address = card.data.adr._data;

            if (address != ";;;;;;") {
                address = address.split(";");

                address = address[2] + ", " + address[3] + ", " + address[4] + ", " + address[5];
            } else {
                address = "";
            }
        }

        if (card.data.tel !== undefined) {
            var phoneNumbers = card.data.tel;
            var numbersText = ``;
            if (phoneNumbers.constructor === Array) {
                phoneNumbers.forEach(number => {
                    numbersText += number._data.replace(/\D/g, '') + ", ";
                });
            } else {
                numbersText = phoneNumbers._data.replace(/\D/g, '');
            }
        }

        if (card.data.email !== undefined) {
            var emails = card.data.email;
            var emailsText = ``;
            if (typeof emails != "undefined") {
                if (emails.constructor === Array) {
                    emails.forEach(email => {
                        emailsText += email._data + ", ";
                    });
                } else {
                    emailsText = emails._data;
                }
            } else {
                emailsText = ``;
            }
        }


        var bday = "";

        if (typeof card.data.bday == "undefined") {
            bday = "";
        } else {

            bday = card.data.bday._data;
            bday = new Date(bday);
            bday = bday.toLocaleDateString("en-US");
        }

        var note = "";
        if (typeof card.data.note == "undefined") {
            note = "";
        } else {
            note = card.data.note._data;
        }

        var orgInfo = "";
        if (typeof card.data.org == "undefined") {
            orgInfo = "";
        } else {
            orgInfo = card.data.org._data;;
        }

        orgInfo = orgInfo.replace(';', ' ');

        tableInfo += `
                    <tr>
                        <td id="FN">${card.data.fn._data}</td>
                        <td id="ADR">${address}</td>
                        <td id="TEL">${numbersText}</td>
                        <td id="EMAIL">${emailsText}</td>
                        <td id="DOB">${bday}</td>
                        <td id="NOTES">${orgInfo} </br> 
                    `;

        console.log(card);
        card = card.toString('4.0');

        tableInfo += `
                    ${handleString(card)}</td>
                    </tr>
                    `
        tableBodyInfo.innerHTML = tableInfo;
    });
    tableBodyInfo.innerHTML = tableInfo;
}

/*
    API Asana TBD if it's gonna be developed or not
*/
// var buttonTest = document.getElementById('testAPI')

// buttonTest.addEventListener('click', (e) => {
//     axios({
//         url: 'https://app.asana.com/api/1.0/projects?limit=15&workspace=542847682503709',
//         method: 'get',
//         headers: {"Authorization": " Bearer 0/30d2c20be7ec2ee5a09ce839ec6aef04"}
//         }).then((res)=>{
//             const table =  document.getElementById("tbody-asana");
//             var tbody = ``;
//             console.log(res.data.data);
//             res = res.data.data;
//             res.forEach(project => {
//                 tbody += `
//                     <tr>
//                     <td>${project.id}</td>
//                     <td>${project.name}</td>
//                     </tr>
//                 `
//             })   
//             table.innerHTML = tbody;        
//         }).catch(e => {
//             console.log(e);
//         });
// });

