const Meeti = require('../../models/Meeti');
const Groups = require('../../models/Groups');
const Users = require('../../models/Users');
const formatDate = require('../../handlers/formatDate');

const Op = require('sequelize').Op


exports.searchResults = async (req , res) => {

    // Read data
    const { category, title, city, country  } = req.query;

    // If category is empty
    const query = {
        model: Groups
    };

    if(category !== '') {
        query.where = { categoryId: { [Op.eq]: category } };
    }

    // Filter meetis by search terms
    const meetis = await Meeti.findAll({
        where: {
            title: { [Op.iLike]: '%' + title + '%' },
            city:{ [Op.iLike]: '%' + city + '%' },
            country: { [Op.iLike]: '%' + country + '%' }
        },
        include: [
            query,
            {
                model: Users,
                attributes: ['id', 'name', 'image']
            }
        ]
    });

    // Pass results to the view
    res.render('search', {
        pageName: 'Search Results',
        meetis,
        formatDate: formatDate.formatFullDate
    });
};