# Automation - Converted Latest News in Audio and PDF form and mailed to different users

An automatic solution to read/listen latest news. This will really help those people who are always busy in travelling or who do not have time to read the news and also it will help blind people as there will be an automatic way for them to hear out the news.
With just a single step the user can email the audio and pdf file to any number of other users.

<a href = "https://www.linkedin.com/posts/riya-gupta-7888961b7_hackathon-puppeteer-automation-activity-6789592580364533760-CSU0">Demo</a>

### Libraries Required/Installed - 
1. puppeteer    -> npm install puppeteer
2. fs   
3. path
4. gtts         -> npm install gtts
5. nodemailer   -> npm install nodemailer


### Files Imported
1. gmailAcc  -> module having sender's gmail username and password



### Project Explaination - 
1. <p>Visit the news website as per the category input given by the user(Eg: Politics, Entertainment,etc.)</p>
   <p>Input : node app.js Politics</p>
   <p>(If you don't mention the category it will combination news....)</p><br>
  
   <img src = "readmeImage/Screenshot (48).png" width = 700 height = 500><br><br>
2. <p>It will extract the news and store it in a JSON file.</p><br>
   <img src = "readmeImage/Screenshot (47).png" width = 700 height = 500><br><br>

3. <p>JSON file gets converted into HTML file and then to a beautiful PDF file.</p><br>
   <img src = "readmeImage/Screenshot (49).png" width = 700 height = 500><br><br>
   
4. <p>All the extracted news will be converted into an audio file with the help of google-text-to-speech.</p><br>

5. <p>After this, both PDF and audio file will be send to all the specified users using nodemailer.</p><br>
   <img src = "readmeImage/Screenshot (52).png" width = 700 height = 500><br><br>

These files can be downloaded by the users for future use.
