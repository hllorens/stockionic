# stockionic
stocks analysis and alerts

# installation
- Install nodejs (last version works, tested 8.9.1 with npm 5.5.1), windows msi installer

- Need to configure a firebase project or have access to the existing one

-- E.g., for auth go to console, authentication and at top right see "WEB SETUP" copy that to firebase.config.ts
-- The web api key you can find it in config.xml but also in google document this better
-- https://console.developers.google.com/apis/credentials?project=cult-game see android vs web-client
(Upload stocks.formatted.json to firebase manually once. NOTE: "." in name like .IDX is troublesome… remove . from key when stored)

- A Php cron will then update only the modified details on firebase (efficient)
- A Php cron will send alerts when needed to the relevant users


- Make sure you add the domain to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.


- Need ionic/cordova (ionic serve, ionic build android --prod)

TO REVIEW --------
To have the CLI

Install  ionic 3.20.0 or later

Install cordova 8.0.0 or later

-- npm install @ionic/app-scripts@latest --save-dev  # to ensure last version is used
-- npm install angularfire2 firebase  
-- for android auth add: cordova plugin add cordova-plugin-googleplus (if it is not added automatically from config.xml)

- Need the server side of it (see hllorens/cult github repo)
END TO REVIEW------



# Tech doc
src/pages/stocks/stocks.ts is the main page and there you can se how firebase is now configured as provider instead of the old "cult" php model
main files are:
app/  xxx and modules
pages/
lib/
providers/
...

