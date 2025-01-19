import { MongoClient } from 'mongodb';
import 'dotenv/config'


// console.log(process.env);
MongoClient.connect('mongodb://mongoadmin:secret@localhost:5000/trendDatabase');