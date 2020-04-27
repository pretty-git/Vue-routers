<template>
  <div>
    <div style="margin:40px 0 40px 40px;">
      <el-row type="flex" :gutter="10">
        <el-col :xs="18" :sm="15" :md="15" :lg="15" :xl="8">
          <el-select v-model="schoolId" size="medium" placeholder="请选择学校" :disabled="ifedtie" @change="chooseschool">
            <el-option
              v-for="item in schooloptions"
              :key="item.schoolId"
              :label="item.schoolName"
              :value="item.schoolId"
            />
          </el-select>
          <el-select v-model="gradeId" size="medium" placeholder="请选择年级" :disabled="ifedtie" @change="choosegrade">
            <el-option
              v-for="item in gradeoptions"
              :key="item.gradeId"
              :label="item.gradeName"
              :value="item.gradeId"
            />
          </el-select>
        </el-col>
        <el-col :xs="5" :sm="5" :md="5" :lg="6" :xl="5"><el-input
          v-model="schoolName"
          placeholder="请输入年级名称"
          prefix-icon="el-icon-search"
          @input="searchvalue"
        /></el-col>
        <el-button type="primary" icon="el-icon-search" size="small" @click="serchbtn">搜索</el-button>
      </el-row>
    </div>
    <el-row>
      <div style="margin:20px 0;width:100%;display:flex;">
        <div style="width:50%;margin:auto;padding-left:15%;">
          <el-button type="primary" @click="dialogFormVisible = true,dialogtitle = '新增年级'">新增年级</el-button>
        </div>
        <div style="width:50%;margin:auto;padding-left:20%;">
          <el-button type="success" @click="chooseAll">全选</el-button>
          <el-button type="danger" @click="deleteAll">删除年级</el-button>
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
          label="年级名称"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.gradeName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="所属学校"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.schoolName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="最近一次修改时间"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
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
        <el-form-item label="请选择学校：" :label-width="formLabelWidth">
          <el-select v-model="form.schoolId" size="medium" placeholder="请选择学校" :disabled="ifedtie" @change="chooseschooladd">
            <el-option
              v-for="item in schooloptions"
              :key="item.schoolId"
              :label="item.schoolName"
              :value="item.schoolId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年级名称：" :label-width="formLabelWidth">
          <el-input v-model="form.gradeName" size="medium" placeholder="请输入" :disabled="ifedtie" />
        </el-form-item>
      </el-form>
      <div v-if="dialogtitle!=='年级信息'" slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addnewgrade">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import 'vue-area-linkage/dist/index.css'
export default {
  data() {
    return {
      classoptions: [], // 班级列表
      gradeoptions: [], // 年级列表
      schooloptions: [], // 年级列表
      tableData: [],
      schoolName: '',
      memberName: '', // 搜索
      schoolId: '', // 绑定查询学校
      gradeId: '', // 绑定查询年级
      dialogtitle: '新增年级',
      dialogFormVisible: false,
      form: {
        gradeName: '',
        schoolId: '请选择学校'
      },
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
    async selectchange() { // 首次加载获取学校
      this.schooloptions = JSON.parse(Cookies.get('schoolInfos'))
      // console.log(this.schooloptions)
    },
    // 年级三级联动
    async chooseschool(e) { // 查询年级
      const cfg = {
        method: 'get',
        url: this.$URL + `/member/manager/getGradeInfoList/${e}`,
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.gradeoptions = res.data.data
    },
    async choosegrade(e) { // 查询班级
      const cfg = {
        method: 'get',
        url: this.$URL + `/member/manager/getClassInfoByGId/${e}`,
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.classoptions = res.data.data
    },
    async choosesclass(e) { // 得到班级
      // console.log(e, '班级')
    },
    chooseschooladd(e) {
      this.form.schoolId = e
    },
    changepage(e) { // 分页
      this.currentpage = e
      this.showAll()
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
        url: this.$URL + '/grade/setting/getGradeInfoList',
        data: {
          pageSize: 10,
          page: this.currentpage,
          gradeId: this.gradeId,
          schoolId: this.schoolId,
          gradeName: this.schoolName
        },
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.tableData = res.data.data.rows
      for (var item of this.tableData) {
        item.createTime = this.resolvingDate(item.createTime)
      }
      this.total = res.data.data.records
      this.fullscreenLoading = false
    },
    async handleEdit(index, row) {
      this.ifedtie = false
      this.dialogtitle = '修改年级'
      this.dialogFormVisible = true
      this.cuurentindex = index
      const cfg = {
        method: 'get',
        headers: 'json',
        url: this.$URL + `/grade/setting/getGradeInfoById/${row.gradeId}`
      }
      var ress = await this.$http(cfg)
      this.form = {
        schoolId: ress.data.data.schoolId,
        gradeId: ress.data.data.gradeId,
        gradeName: ress.data.data.gradeName
      }
    },
    async handleDelete(index, row) {
      const cfg = {
        method: 'DELETE',
        url: this.$URL + `/grade/setting/delGradeInfo/${row.gradeId}`
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
    async addnewgrade() { // 新增年级
      for (var item in this.form) {
        if (this.form[item] === '请选择学校' || this.form[item] === '' || this.form[item] === null) {
          this.$message.error('请检查数据的完整性')
          return
        }
      }
      if (this.dialogtitle === '新增年级') {
        var list = {
          gradeName: this.form.gradeName,
          schoolId: this.form.schoolId }
        const cfg = {
          method: 'POST',
          url: this.$URL + '/grade/setting/addGradeInfo',
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
          url: this.$URL + '/grade/setting/updateGradeInfo',
          data: {
            schoolId: this.form.schoolId,
            gradeId: this.form.gradeId,
            gradeName: this.form.gradeName
          }
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
            list.push(item.gradeId)
          }
        }
        var lists = list.join(',')
        const cfg = {
          method: 'DELETE',
          url: this.$URL + `/grade/setting/delGradeInfo/${lists}`
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
