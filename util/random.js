module.exports = {
  // 从计划中随机获取一个单词
  random: async (model, list) => {
    // 根据未完成列表 生成一个随机数
    const random = Math.floor(Math.random() * list.length);
    const item = list[random];

    return await model.findById(item);
  },
  randomList: async (model, limit, id) => {
    const count = await model.countDocuments().exec();
    let list = [];
    if (count <= limit) {
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
      let wordIdList = [id];
      for (let index = 0; index < limit - 1; index++) {
        const random = Math.floor(Math.random() * (count - list.length - 1));
        const result = await model
          .find({ _id: { $nin: wordIdList } })
          .skip(random)
          .limit(1)
          .exec();
        // console.log(result);
        list.push({ value: result[0].basic.explains.join('；'), index: 0 });
        wordIdList.push(result[0]._id);
      }
    }
    return list;

    // return list;
  },
};
