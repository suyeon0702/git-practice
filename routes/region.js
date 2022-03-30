import { response } from 'express'
import express from 'express'
import {regionHome, add, add_process, Delete, delete_process} from '../controllers/regionController'
let regionRouter = express.Router();

regionRouter.get('/', regionHome);

regionRouter.get('/add', add);

regionRouter.post('/add_process', add_process);

regionRouter.get('/delete', Delete)

regionRouter.post('/delete_process', delete_process)

export default regionRouter;
