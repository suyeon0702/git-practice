import regionList from '../models/region'

export const regionHome = async (req, res) => {
    regionList.find({}, (error, regions) => {
      return res.render('regionList', {regions})
    })
}

export const add = async (req, res) => {
   return res.render("addRegion")
}

export const add_process = async (req, res) => {
    const {region, regionNumber} = req.body
    const newRegion = new regionList({
      region: region,
      regionNumber: regionNumber,
    })
    await newRegion.save()
    return res.redirect('/regions')
}

export const Delete = async (request, response) => {
    return response.render("deleteRegion")
}

export const delete_process = async (request, response) => {
    const {region} = request.body
    await regionList.deleteOne({region: region}, (err) => {
        if(err) console.log(err)
    })
  
    return response.redirect(`/regions`)
}