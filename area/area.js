// pages/area/area.js
import api from "../../config/api.js";
import util from "../../utils/util"

Component({
  properties: {
    label: {
      type: String,
      value: '地区'
    },
    placeholder: {
      type: String,
      value: '请选择地区'
    },
    // 地址回显 传入三级dictCode
    defaultArea: {
      type: Array,
      observer: function(data) {
        if (data[0] != '' && data[0] != null) {
          this.areaHandle(data[0],data[1],data[2])
        } else {
         
        }
      }
    }
  },
  data: {
    // 省市县级联
    areaList: [
      {
        values: [],
        className: 'province'
      },
      {
        values: [],
        className: 'city'
      },
      {
        values: [],
        ckassName: 'country'
      }
    ],
    showAddressChoose: false,
    area: '',
    // 结果
    result: []
  },
  created() {
    const token = wx.getStorageSync('token');
    let that = this
    // 获取级联数据
    wx.request({
      url: api.getDicts + 'sys_province',
      method: 'GET',
      header: {'Authorization': token},
      success(res) {
        that.dictAssignment(res, 0)
        that.getCityDict(res.data.data[0].dictCode)
      }
    })
  },
  methods: {
    onAreaChange(event) {
      let index = event.detail.index
      let dictCode = event.detail.value[index].dictCode
      if (index == 0) {
        this.getCityDict(dictCode)
      } else if (index == 1) {
        this.getCountryDict(dictCode)
      }
    },
    onAreaConfirm(event) {
      let res = event.detail.value
      let dictValues = []
      res.forEach((val, index) => {
        dictValues.push(res[index].dictValue)
      })
      this.setData({
        result: dictValues,
        showAddressChoose: false,
        area: res[0].dictLabel + ' ' + res[1].dictLabel + ' ' + res[2].dictLabel
      })
      this.triggerEvent('confirm',{
        area: this.data.result
      })
    },
    onOpen() {
      this.setData({
        showAddressChoose: true
      })
      this.triggerEvent('open',{
        
      })
    },
    onClose() {
      this.setData({
        showAddressChoose: false
      })
      this.triggerEvent('close',{
        
      })
    },
    // 获取县市数据
    getCityDict(dictCode) {
      let that = this
      const token = wx.getStorageSync('token');
      // 获取级联数据
      wx.request({
        url: api.getDicts + 'sys_province_' + dictCode,
        method: 'GET',
        header: {'Authorization': token},
        success(res) {
          that.dictAssignment(res, 1)
          that.getCountryDict(res.data.data[0].dictCode)
        }
      })
    },
    // 获取区乡镇数据
    getCountryDict(dictCode) {
      let that = this
      const token = wx.getStorageSync('token');
      // 获取级联数据
      wx.request({
        url: api.getDicts + 'sys_province_' + dictCode,
        method: 'GET',
        header: {'Authorization': token},
        success(res) {
          that.dictAssignment(res, 2)
        }
      })
    },
    // 字典通用赋值方法
    dictAssignment(res, index) {
      let dictData = res.data.data
      let values = []
      let dictForm = {}
      dictData.forEach(val => {
        dictForm = {
          dictLabel: val.dictLabel,
          dictValue: val.dictValue,
          dictCode: val.dictCode
        }
        values.push(dictForm)
      })
      let dateName = 'areaList[' + index + '].values'
      this.setData({
        [dateName]: values,
      })
    },
    // 地址回显处理
    areaHandle(provinceCode,cityCode,countryCode) {
      let area = ''
      util.getDicts('sys_province').then(res => {      
        const dict = this.dictCodeHandle(res.data, provinceCode)
        area = dict.dictLabel + ' '
        const dictUrl = 'sys_province_' + dict.dictCode
        util.getDicts(dictUrl).then(res => {
          const dict = this.dictCodeHandle(res.data, cityCode)
          area += dict.dictLabel + ' '
          const dictUrl = 'sys_province_' + dict.dictCode
          util.getDicts(dictUrl).then(res => {
            const dict = this.dictCodeHandle(res.data, countryCode)
            area += dict.dictLabel
            this.setData({
              area: area,
            })

          })
        })
      })
    },
    // 遍历获取字典dictCode
    dictCodeHandle(data,code) {
      let res = ''
      data.forEach(val => {
        if (val.dictValue == code) {
          res = val
        }
      })
      return res
    },
  }
})
