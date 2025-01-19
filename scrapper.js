import { Builder, By, Key, until } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'trendDatabase';
const COLLECTION_NAME = 'trendCollection';

export default async function fetchTrends() {
    const USERNAME = process.env.USERNAME;
    const PASSWORD = process.env.PASSWORD;

    if (!USERNAME || !PASSWORD) {
        console.error('username or password not found');
        process.exit(1);
    }

    const options = new firefox.Options();
    // options.addArguments('--headless', 'headless');
    let driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

    try {
        await driver.get('https://www.x.com');

        const searchElements = await driver.findElements(By.css('[aria-label="Search and explore"]'));
        let isLogin = searchElements.length > 0;

        if (!isLogin) {
            await driver.get('https://www.x.com/login');
            const usernameField = await driver.wait(until.elementLocated(By.name('text')), 90000);
            await usernameField.sendKeys(USERNAME, Key.RETURN);

            const passwordField = await driver.wait(until.elementLocated(By.name('password')), 10000);
            await passwordField.sendKeys(PASSWORD, Key.RETURN);
        }

        await driver.wait(until.elementLocated(By.xpath('//*[@id="react-root"]/div/div/div[2]/header/div/div/div/div[1]/div[2]/nav/a[2]')),10000).click();
        const trendSection = await driver.wait(until.elementLocated(By.css('[aria-label="Timeline: Explore"]')), 10000);
        await driver.wait(until.elementIsVisible(trendSection.findElement(By.css('div'))),10000);
        const trends = await driver.wait(until.elementsLocated(By.css('[data-testid="trend"]')), 10000);



        let trendData = [];
        for (let i = 0; i < trends.length && i < 5; i++) {
            let text = await trends[i].getText();
            trendData.push(text);
        }

        const dateTime = new Date().toLocaleString();


        const ipAddress = await axios.get('https://api.ipify.org?format=json').then(response => response.data.ip);


        const uniqueId = uuidv4();


        const trendRecord = {
            _id: uniqueId,
            trend1: trendData[0],
            trend2: trendData[1],
            trend3: trendData[2],
            trend4: trendData[3],
            trend5: trendData[4],
            dateTime: dateTime,
            ipAddress: ipAddress,
        };


        const client = new MongoClient(MONGO_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        await collection.insertOne(trendRecord);
        await client.close();

        console.log(`Record inserted with ID: ${uniqueId}`);

        return trendRecord;

    } catch (error) {
        console.error('Error during script execution:', error);
    } finally {
        await driver.quit();
    }
};
