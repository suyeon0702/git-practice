import express from 'express';
import { response } from 'express';
import { NotExtended } from 'http-errors';
import {home, getinfo, getinfo_process, Delete, delete_process, update, update_process, edit_process, watch} from '../controllers/infoController'
import {matching, select} from '../controllers/matchingFunction'
var indexRouter = express.Router();

indexRouter.get('/',home)

indexRouter.get('/getinfo', getinfo)

indexRouter.post('/getinfo_process', getinfo_process)

indexRouter.get('/delete', Delete)

indexRouter.post('/delete_process', delete_process)

indexRouter.get('/update', update)

indexRouter.post('/update_process', update_process)

indexRouter.post('/edit_process', edit_process)

indexRouter.get('/matching', matching)

indexRouter.get('/select', select)

indexRouter.get('/info/:id', watch)

export default indexRouter