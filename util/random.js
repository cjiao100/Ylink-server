module.exports = {
  random: async (model, list) => {
    const count = await model.countDocuments().exec();
    const random = Math.floor(Math.random() * count);

    if (list) {
      const item = list[random];
      return await model.findById(item);
    } else {
      const result = await model
        .find()
        .skip(random)
        .limit(1)
        .exec();
      return result;
    }
  },
  randomList: async (model, limit, id) => {
    const count = await model.countDocuments().exec();
    let list = [];
    if (count < limit) {
      const result = await model.find(
        { _id: { $ne: id } },
        { 'basic.explains': 1 },
      );
      list = result
        .sort(function() {
          return Math.random() - 0.5;
        })
        .map(item => ({ value: item.basic.explains.join('；'), index: 0 }));
    } else {
      for (let index = 0; index < limit - 1; index++) {
        const random = Math.floor(Math.random() * count);
        const result = await model
          .findOne({ _id: { $ne: id } })
          .skip(random)
          .limit(1)
          .exec();
        list.push({ value: result.basic.explains.join('；'), index: 0 });
      }
    }
    return list;

    // return list;
  },
};
