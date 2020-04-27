<template>
  <div>
    <div style="margin:40px 0 40px 40px;">
      <el-row type="flex" :gutter="10">
        <el-col :xs="20" :sm="20" :md="14" :lg="14" :xl="10">
          <area-select v-model="selected" type="all" :level="2" :data="pcaa" :placeholders="placeholders" @change="searchcity" /></el-col>
        <el-col :xs="8" :sm="5" :md="5" :lg="6" :xl="5"><el-input
          v-model="schoolName"
          placeholder="请输入关键字搜索"
          prefix-icon="el-icon-search"
          @input="searchvalue"
        /></el-col>
        <el-button type="primary" icon="el-icon-search" size="small" @click="serchbtn">搜索</el-button>
      </el-row>
    </div>
    <el-row>
      <div style="margin:20px 0;width:100%;display:flex;">
        <div style="width:50%;margin:auto;padding-left:15%;">
          <el-button type="primary" @click="dialogFormVisible = true,dialogtitle = '新增学校'">新增学校</el-button>
        </div>
        <div style="width:50%;margin:auto;padding-left:20%;">
          <el-button type="success" @click="chooseAll">全选</el-button>
          <el-button type="danger" @click="deleteAll">删除学校</el-button>
        </div>
      </div>
    </el-row>
    <div style="margin:20px 10%;">
      <el-table
        ref="multipleTable"
        v-loading="fullscreenLoading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="100"
        />
        <el-table-column
          label="学校"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.schoolName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="校长"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.headmasterName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="联系方式"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.userCode }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="分组"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.groupName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
            <el-button
              size="mini"
              @click="handleShow(scope.$index, scope.row)"
            >查看</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:40px;">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="count"
          :current-page="currentpage"
          @current-change="changepage"
        />
      </div>
    </div>
    <el-dialog :title="dialogtitle" :visible.sync="dialogFormVisible" width="50%">
      <el-form :model="form">
        <div style="width: 60%;">
          <el-form-item label="学校名称：" :label-width="formLabelWidth">
            <el-input v-model="form.schoolName" size="medium" placeholder="请输入" :disabled="ifedtie" />
          </el-form-item>
          <div style="margin:10px 0 10px 110px;">
            <area-select v-model="selectedform" type="all" :level="2" :data="pcaa" size="small" :disabled="ifedtie" @change="searchcityform" />
          </div>
          <el-form-item label="学校地址：" :label-width="formLabelWidth">
            <el-input v-model="form.schoolAddress" autocomplete="off" size="medium" placeholder="请输入详细地址" :disabled="ifedtie" />
          </el-form-item>
          <el-form-item label="校长姓名：" :label-width="formLabelWidth">
            <el-input v-model="form.headmasterName" autocomplete="off" size="medium" placeholder="请输入" :disabled="ifedtie" />
          </el-form-item>
          <el-form-item label="教师数量：" :label-width="formLabelWidth">
            <el-input v-model="form.teacherQuantity" size="medium" placeholder="请输入" :disabled="ifedtie" />
          </el-form-item>
          <el-form-item label="学生数量：" :label-width="formLabelWidth">
            <el-input v-model="form.studentQuantity" size="medium" placeholder="请输入" :disabled="ifedtie" />
          </el-form-item>
          <el-form-item label="班级数量：" :label-width="formLabelWidth">
            <el-input v-model="form.classQuantity" size="medium" placeholder="请输入" :disabled="ifedtie" />
          </el-form-item>
          <el-form-item label="学校分组：" :label-width="formLabelWidth">
            <el-select v-model="form.groupId" size="medium" placeholder="请选择" :disabled="ifedtie" @change="rolenames">
              <el-option
                v-for="item in options"
                :key="item.groupId"
                :label="item.groupName"
                :value="item.groupId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="联系方式：" :label-width="formLabelWidth">
            <el-input v-model="form.userCode" placeholder="请输入" :disabled="ifedtie" @change="newrolename2" />
          </el-form-item>
          <el-form-item v-if="dialogtitle!=='学校信息'" label="密码设置：" :label-width="formLabelWidth">
            <el-input v-model="form.password" show-password autocomplete="off" placeholder="密码" :disabled="ifedtie" />
          </el-form-item>
          <el-form-item v-if="dialogtitle==='学校信息'" label="最近修改时间：" :label-width="formLabelWidth">
            <el-input v-model="form.changetime" :disabled="ifedtie" />
          </el-form-item>
        </div>
      </el-form>
      <div v-if="dialogtitle!=='学校信息'" slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addnewrole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import md5 from 'js-md5'
import { pca, pcaa } from 'area-data'
import VueAreaLinkage from 'vue-area-linkage'
Vue.use(VueAreaLinkage)
import 'vue-area-linkage/dist/index.css'
export default {
  data() {
    return {
      placeholders: ['请选择省份', '请选择市', '请选择区'],
      pca: pca,
      pcaa: pcaa,
      selected: [],
      selectedform: [], // 三级联动
      tableData: [],
      schoolName: '',
      schoolProvince: '',
      schoolCity: '',
      schoolArea: '',
      dialogtitle: '新增学校',
      dialogFormVisible: false,
      form: {
        schoolName: '',
        schoolProvince: '',
        schoolCity: '',
        password: '',
        schoolArea: '',
        studentQuantity: '',
        teacherQuantity: '',
        classQuantity: '',
        userCode: '',
        groupId: '',
        schoolAddress: '',
        headmasterName: '',
        changetime: 'date',
        schoolId: 'id',
        adminId: 'id'
      },
      value: '',
      formLabelWidth: '120px',
      ifedtie: false,
      multipleSelection: [],
      cuurentindex: 0,
      options: [],
      total: 0,
      count: 10,
      currentpage: 1,
      fullscreenLoading: true
    }
  },
  created() {
    this.showAll()
    this.selectchange()
  },
  methods: {
    changepage(e) {
      this.currentpage = e
      this.showAll()
    },
    async newrolename2(e) { // 账号
      const cfg = {
        method: 'get',
        url: this.$URL + `/collective/codeIsExists/${e}`,
        headers: 'json'
      }
      var res = await this.$http(cfg)
      if (res.data.msg === 'isExists') {
        this.$message.error('该账号已存在')
      }
    },
    searchcity(e) { // 三级城市联动
      var list = []
      for (var item in e) {
        for (var its in e[item]) {
          list.push(e[item][its])
        }
      }
      this.selected = e
      this.schoolProvince = list[0]
      this.schoolCity = list[1]
      this.schoolArea = list[2]
    },
    searchcityform(e) { // 三级城市联动
      var list = []
      for (var item in e) {
        for (var its in e[item]) {
          list.push(e[item][its])
        }
      }
      this.selectedform = []
      this.selectedform = list
      this.form.schoolProvince = list[0]
      this.form.schoolCity = list[1]
      this.form.schoolArea = list[2]
    },
    searchvalue(e) {
      this.schoolName = e
    },
    serchbtn() {
      this.showAll()
    },
    async showAll() {
      const cfg = {
        method: 'post',
        url: this.$URL + '/system/schoolInfo/getSchoolInfoList',
        data: {
          pageSize: 10,
          page: this.currentpage,
          schoolName: this.schoolName,
          schoolProvince: this.schoolProvince,
          schoolCity: this.schoolCity,
          schoolArea: this.schoolArea
        },
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.tableData = res.data.data.rows
      this.total = res.data.data.records
      this.fullscreenLoading = false
    },
    async handleShow(index, row) {
      this.dialogFormVisible = true
      this.dialogtitle = '学校信息'
      this.ifedtie = true
      const cfg = {
        method: 'get', // 单个查询
        headers: 'json',
        url: this.$URL + `/system/schoolInfo/getSchoolInfoById/${row.schoolId}`
      }
      var ress = await this.$http(cfg)
      var date = this.resolvingDate(ress.data.data.createTime)
      this.form = {
        schoolName: ress.data.data.schoolName,
        schoolProvince: ress.data.data.schoolProvince,
        schoolCity: ress.data.data.schoolCity,
        schoolArea: ress.data.data.schoolArea,
        studentQuantity: ress.data.data.studentQuantity,
        teacherQuantity: ress.data.data.teacherQuantity,
        classQuantity: ress.data.data.classQuantity,
        userCode: ress.data.data.userCode,
        groupId: ress.data.data.groupId,
        schoolAddress: ress.data.data.schoolAddress,
        headmasterName: ress.data.data.headmasterName,
        changetime: date
      }
      this.selectedform = []
      this.selectedform.push(this.form.schoolProvince)
      this.selectedform.push(this.form.schoolCity)
      this.selectedform.push(this.form.schoolArea)
      // console.log(this.selectedform)
    },
    async handleEdit(index, row) {
      this.ifedtie = false
      this.dialogtitle = '修改学校'
      this.dialogFormVisible = true
      this.cuurentindex = index
      const cfg = {
        method: 'get',
        headers: 'json',
        url: this.$URL + `/system/schoolInfo/getSchoolInfoById/${row.schoolId}`
      }
      var ress = await this.$http(cfg)
      this.form = {
        password: '',
        schoolId: ress.data.data.schoolId,
        schoolName: ress.data.data.schoolName,
        schoolProvince: ress.data.data.schoolProvince,
        schoolCity: ress.data.data.schoolCity,
        schoolArea: ress.data.data.schoolArea,
        studentQuantity: ress.data.data.studentQuantity,
        teacherQuantity: ress.data.data.teacherQuantity,
        classQuantity: ress.data.data.classQuantity,
        userCode: ress.data.data.userCode,
        groupId: ress.data.data.groupId,
        schoolAddress: ress.data.data.schoolAddress,
        headmasterName: ress.data.data.headmasterName,
        adminId: ress.data.data.adminId
      }
      this.selectedform = []
      this.selectedform.push(this.form.schoolProvince)
      this.selectedform.push(this.form.schoolCity)
      this.selectedform.push(this.form.schoolArea)
    },
    async handleDelete(index, row) {
      const cfg = {
        method: 'DELETE',
        url: this.$URL + `/system/schoolInfo/delSchoolInfo/${row.schoolId}`
      }
      var res = await this.$http(cfg)
      if (res.data.data === 'SUCCESS') {
        this.$message({
          message: '删除成功',
          type: 'success'
        })
      }
      this.showAll()
    },
    async addnewrole() { // 新增角色
      // console.log(this.form)
      for (var item in this.form) {
        if (this.form[item] === '') {
          this.$message.error('请检查数据的完整性')
          return
        }
      }
      if (this.dialogtitle === '新增学校') {
        var list = {
          schoolName: this.form.schoolName,
          schoolProvince: this.form.schoolProvince,
          schoolCity: this.form.schoolCity,
          schoolArea: this.form.schoolArea,
          studentQuantity: this.form.studentQuantity,
          teacherQuantity: this.form.teacherQuantity,
          classQuantity: this.form.classQuantity,
          userCode: this.form.userCode,
          groupId: this.form.groupId,
          schoolAddress: this.form.schoolAddress,
          headmasterName: this.form.headmasterName,
          password: md5(this.form.password) }
        // console.log(list, '1215')
        const cfg = {
          method: 'POST',
          url: this.$URL + '/system/schoolInfo/addSchoolInfo',
          data: list
        }
        var res = await this.$http(cfg)
        if (res.data.data === 'SUCCESS') {
          this.$message({
            message: '添加成功',
            type: 'success'
          })
        }
      } else {
        const cfg = {
          method: 'POST',
          url: this.$URL + '/system/schoolInfo/updateSchoolInfo',
          data: {
            adminId: this.form.adminId,
            schoolId: this.form.schoolId,
            schoolName: this.form.schoolName,
            schoolProvince: this.form.schoolProvince,
            schoolCity: this.form.schoolCity,
            schoolArea: this.form.schoolArea,
            studentQuantity: this.form.studentQuantity,
            teacherQuantity: this.form.teacherQuantity,
            classQuantity: this.form.classQuantity,
            userCode: this.form.userCode,
            groupId: this.form.groupId,
            schoolAddress: this.form.schoolAddress,
            headmasterName: this.form.headmasterName,
            password: md5(this.form.password) }
        }
        var ress = await this.$http(cfg)
        if (ress.data.data === 'SUCCESS') {
          this.$message({
            message: '编辑成功',
            type: 'success'
          })
        }
      }
      this.showAll()
      this.dialogFormVisible = false
    },
    rolenames(e) {
      this.form.groupId = e
    },
    async selectchange() {
      const cfg = {
        method: 'POST',
        url: this.$URL + '/system/schoolInfo/getSchoolGroupListByCondition',
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.options = res.data.data
    },
    newrolename3(e) { // 密码
      this.form.password = e
    },
    chooseAll() { // 选择全部
      if (this.tableData) {
        this.tableData.forEach(row => {
          this.$refs.multipleTable.toggleAllSelection(row)
        })
      }
    },
    handleSelectionChange(val) {
      // console.log(val, '222222')
      this.multipleSelection = val
    },
    async deleteAll() { // 删除选中的
      if (this.multipleSelection.length === 0) {
        this.$message.error('请选择删除对象')
      } else {
        var list = []
        for (var item of this.multipleSelection) {
          if (this.tableData.includes(item)) {
            list.push(item.schoolId)
          }
        }
        var lists = list.join(',')
        const cfg = {
          method: 'DELETE',
          url: this.$URL + `/system/schoolInfo/delSchoolInfo/${lists}`
        }
        var res = await this.$http(cfg)
        if (res.data.data === 'SUCCESS') {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
        }
        this.showAll()
      }
    }
  }
}
</script>
