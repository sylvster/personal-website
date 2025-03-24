function updateTime() {

    const timePST = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        timeStyle: "medium",
    }).format(new Date());

    const [time, period] = timePST.split(" ");
    const [hour, minute, second] = time.split(":");

    document.getElementById("my-time").textContent = `${hour}:${minute}:${second} ${period}`;

    document.getElementById("my-hour-arbor").style.transform = `rotate(${30*hour + minute/2}deg)`
    document.getElementById("my-minute-arbor").style.transform = `rotate(${6*minute}deg)`
    document.getElementById("my-second-arbor").style.transform = `rotate(${6*second}deg)`

    // Device time
    const deviceTime = new Date();
    const deviceHour = deviceTime.getHours();
    const deviceMin = deviceTime.getMinutes();
    const deviceSec = deviceTime.getSeconds();

    document.getElementById("your-hour-arbor").style.transform = `rotate(${30 * deviceHour + deviceMin/2}deg)`
    document.getElementById("your-minute-arbor").style.transform = `rotate(${6*deviceMin}deg)`
    document.getElementById("your-second-arbor").style.transform = `rotate(${6*deviceSec}deg)`

}

function getTimezoneOffset() {
    const localTime = new Date();
    const pstOffset = -7;
    const localOffset = - localTime.getTimezoneOffset() / 60;
    const timeDifference = localOffset - pstOffset;

    let outputText = ""

    if(timeDifference === 0) {
        outputText = "in sync with"
    } else if (timeDifference < 0) {
        outputText = `${-timeDifference} hours ahead of`
    } else {
        outputText = `${timeDifference} hours behind of`
    }

    document.getElementById("time-offset").textContent = outputText;
}

function adjustClockHands() {
    const containerWidth = document.getElementById("clock-container").getBoundingClientRect().width;
    const radius = (containerWidth - 60) / 4;

    const secondHands = document.getElementsByClassName("second-hand")
    for(let i = 0; i < secondHands.length; i++) {
        secondHands[i].style.height = `${radius*0.8}px`
    }

    const minuteHands = document.getElementsByClassName("minute-hand")
    for(let i = 0; i < minuteHands.length; i++) {
        minuteHands[i].style.height = `${radius*0.8}px`
    }

    const hourHands = document.getElementsByClassName("hour-hand")
    for(let i = 0; i < hourHands.length; i++) {
        hourHands[i].style.height = `${radius*0.6}px`
    }
}

function readWorkHistory() {
    const careerSpace = document.getElementById("career-box")

    fetch("/data/work.json")
        .then((response) => response.json())
        .then((json) => json.forEach(element => {
                /*
                    Structure:
                    <div id="career-box" class="content-box">
                        <div id="career-item">
                            <img class="logo">
                            <div class="career-data">
                                <h3>, <p>, <p>
                            </div>
                        </div>
                    </div>
                */

                let careerEntry = document.createElement("div");
                careerEntry.className = "career-item"

                let careerData = document.createElement("div");
                careerData.className = "career-data";

                let image = document.createElement("img");
                image.src = `assets/companies/${element["Image"]}`;
                image.className = "logo";

                let name = document.createElement("h3");
                name.textContent = element["Company"];
                let position = document.createElement("p");
                position.textContent = element["Position"];
                let date = document.createElement("p");
                date.textContent = element["Date"]

                careerData.appendChild(name)
                careerData.appendChild(position)
                careerData.appendChild(date)

                careerEntry.appendChild(image)
                careerEntry.appendChild(careerData)

                careerSpace.appendChild(careerEntry)
            })
        );
}

function readSkills() {
    const skillSpace = document.getElementById("skills-box");

    fetch("/data/skills.json")
        .then((response) => response.json())
        .then((json) => json.forEach(element => {
            let category = document.createElement("div");
            category.className = "skills-category";
            category.textContent = element["Category"]
            skillSpace.appendChild(category)

            element["Items"].forEach(text => {
                let item = document.createElement("div");
                item.className = "skills-item";
                item.textContent = text;
                skillSpace.appendChild(item);
            })
        }));
}

class BlogManager {
    constructor() {
        this.datesLog = [];
        this.messageLog = [];
        this.imageLog = [];
        this.captionLog = [];

        this.commitMessage = document.getElementById("display-commit-message");
        this.commitDate = document.getElementById("display-commit-date");
        this.blogImage = document.getElementById("blog-img");
        this.blogCaption = document.getElementById("blog-caption");

        this.leftButton = document.getElementById("blog-button-left");
        this.rightButton = document.getElementById("blog-button-right");

        this.index = 0;

        this.renderLogs();
    }

    async getCommits() {
        await fetch("https://api.github.com/repos/sylvster/personal-website/commits")
            .then((response) => response.json())
            .then((json) => {
                json.forEach(element => {
                    let commit_time = new Date(element["commit"]["committer"]["date"]);
                    let commit_message = element["commit"]["message"];

                    this.datesLog.push(commit_time.toDateString());
                    this.messageLog.push(commit_message);
                })
            })
    }

    async getBlogs() {
        await fetch("/data/blogs.json")
            .then((response) => response.json())
            .then((json) => json.forEach(element => {
                this.imageLog.push(`assets/blogs/${element["image_path"]}`);
                this.captionLog.push(element["caption"]);
            }))
    }

    async renderLogs() {
        await this.getCommits();
        await this.getBlogs();

        this.messageLog.reverse();
        this.datesLog.reverse();

        console.log(this.messageLog);
        console.log(this.captionLog);

        this.enableBlog();
    }

    enableBlog() {
        this.leftButton.addEventListener('click', () => this.changeIndex(-1));
        this.rightButton.addEventListener('click', () => this.changeIndex(1));
        this.renderBlog();
    }

    changeIndex(delta) {
        this.index += delta;
        this.index = Math.max(0, this.index);
        this.index = Math.min(this.index, Math.min(this.messageLog.length - 1, this.captionLog.length - 1));
        this.renderBlog();
    }

    renderBlog() {
        this.commitMessage.textContent = this.messageLog[this.index];
        this.commitDate.textContent = this.datesLog[this.index];
        this.blogImage.src = this.imageLog[this.index];
        this.blogCaption.textContent = this.captionLog[this.index];
    }
}

const blogManager = new BlogManager();

readWorkHistory();
readSkills();

adjustClockHands();
window.addEventListener("resize", adjustClockHands)

getTimezoneOffset();
setInterval(updateTime, 1000)