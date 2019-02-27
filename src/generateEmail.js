
const shell = require('electron').shell
const os = require('os')
var openFolderBtn = document.getElementById("openFolder")
var generateBtn = document.getElementById("GenerateEmail")
var inputName = document.getElementById("inputName")
var fc = document.getElementById("inputFC")
var image1 = document.getElementById("IMG1src")
var image2 = document.getElementById("IMG2src")
var image3 = document.getElementById("IMG3src")
var checkboxFC = document.getElementById("checkboxFC")
var fcDate = document.getElementById("fcDate")

checkboxFC.addEventListener('click', (e) => {
    if (checkboxFC.checked) {
        fc.disabled = false;
        fcDate.classList.remove('hidden');
    } else {
        fcDate.classList.add('hidden');
        fc.disabled = true;
    }
})

generateBtn.addEventListener('click', (e) => {
    e.preventDefault;
    var nameText = inputName.value;
    var fcText = fc.value;
    // var imgSrc1 = "src=\"https://docs.google.com/uc?id=" + image1.value + "\""
    var imgSrc1 = "src=\"https://docs.google.com/uc?id=" + image1.value + "\""
    var imgSrc2 = "src=\"https://docs.google.com/uc?id=" + image2.value + "\""
    var imgSrc3 = "src=\"https://docs.google.com/uc?id=" + image3.value + "\""

    imgSrc1 = imgSrc1.replace("https://drive.google.com/file/d/", '').replace("/view?usp=sharing", '');
    imgSrc2 = imgSrc2.replace("https://drive.google.com/file/d/", '').replace("/view?usp=sharing", '');
    imgSrc3 = imgSrc3.replace("https://drive.google.com/file/d/", '').replace("/view?usp=sharing", '');

    var fileName = os.homedir() + "\\Documents\\email-templates\\template-email.html"
    console.log(fileName)
    fs.readFile(fileName, 'utf-8', function (err, data) {
        content = data;
        content = content.replace("--NAME--", nameText);
        if (checkboxFC.checked) {
            content = content.replace("--FC--", fcText);
        } else {
            content = content.replace("--FC--", "");
            content = content.replace("Thanks and I look forward to seeing you at our meeting.", "");
        }
        content = content.replace("sours1", imgSrc1);
        content = content.replace("sours2", imgSrc2);
        content = content.replace("sours3", imgSrc3);


        try { fs.writeFileSync(`${os.homedir()}\\Documents\\generated-emails\\${nameText}-GeneratedEmail.html`, content, 'utf-8'); }
        catch (e) { alert(e); }
        const filePath = path.join('file://', os.homedir(), `/Documents/generated-emails/${nameText}-GeneratedEmail.html`)
        shell.openItem(filePath)

        inputName.value = "";
        fc.value = "";
        image1.value = "";
        image2.value = "";
        image3.value = "";
    })
})




openFolderBtn.addEventListener('click', (e) => {
    var folderPath = path.join(os.homedir(), "\\Documents\\generated-emails");
    console.log(folderPath)
    shell.showItemInFolder(folderPath)
})




function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
            console.log(`Directory ${curDir} created!`);
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }

            console.log(`Directory ${curDir} already exists!`);
        }

        return curDir;
    }, initDir);
}