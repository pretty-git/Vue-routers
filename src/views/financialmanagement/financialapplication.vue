<template>
  <div>
    <div style="margin:40px 0 40px 40px;">
      <el-row type="flex" :gutter="10">
        <el-col :xs="8" :sm="15" :md="15" :lg="10" :xl="6">
          <el-select v-model="schoolId" size="medium" placeholder="请选择学校" :disabled="ifedtie" @change="rolenames">
            <el-option
              v-for="item in schooloptions"
              :key="item.schoolId"
              :label="item.schoolName"
              :value="item.schoolId"
            />
          </el-select>
          <el-select v-model="roleId" size="medium" placeholder="请选择分组" :disabled="ifedtie" @change="rolenames">
            <el-option
              v-for="item in groupoptions"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            />
          </el-select></el-col>
        <el-col :xs="8" :sm="5" :md="5" :lg="6" :xl="5"><el-input
          v-model="memberName"
          placeholder="请输入成员姓名"
          prefix-icon="el-icon-search"
          @input="searchvalue"
        /></el-col>
        <el-button type="primary" icon="el-icon-search" size="small" @click="serchbtn">搜索</el-button>
      </el-row>
    </div>
    <el-row>
      <div style="margin:20px 0;width:100%;display:flex;">
        <div style="width:50%;margin:auto;padding-left:15%;">
          <el-button type="primary" @click="dialogFormVisible = true,dialogtitle = '新增成员'">新增成员</el-button>
        </div>
        <div style="width:50%;margin:auto;padding-left:20%;">
          <el-button type="success" @click="chooseAll">全选</el-button>
          <el-button type="danger" @click="deleteAll">删除成员</el-button>
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
          label="成员姓名"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.memberName }}</span>
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
          label="任课科目"
          width="300"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.teachSubject }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="任课班级"
          width="300"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.teachClass }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="成员分组"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="联系方式"
          width="200"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.contactWay }}</span>
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
    <el-dialog :title="dialogtitle" :visible.sync="dialogFormVisible" width="70%">
      <el-form :model="form">
        <div style="width: 50%;">
          <el-form-item label="成员名称：" :label-width="formLabelWidth">
            <el-input v-model="form.memberName" size="medium" placeholder="请输入" :disabled="ifedtie" />
          </el-form-item>

          <el-form-item label="联系方式：" :label-width="formLabelWidth">
            <el-input v-model="form.contactWay" autocomplete="off" size="medium" placeholder="请输入" :disabled="ifedtie" @change="newrolename2" />
          </el-form-item>
        </div>
        <el-form-item label="成员分组：" :label-width="formLabelWidth">
          <el-select v-model="form.roleId" size="medium" placeholder="请选择" :disabled="ifedtie">
            <el-option
              v-for="item in groupoptions"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学校选择：" :label-width="formLabelWidth">
          <el-select v-model="form.schoolId" size="medium" placeholder="请选择学校" :disabled="ifedtie" @change="chooseschool">
            <el-option
              v-for="item in schooloptions"
              :key="item.schoolId"
              :label="item.schoolName"
              :value="item.schoolId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性别：" :label-width="formLabelWidth">
          <el-select v-model="form.sex" :disabled="ifedtie" placeholder="请选择">
            <el-option
              v-for="item in sexoptions"
              :key="item.id"
              :label="item.value"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任课班级：" :label-width="formLabelWidth">
          <el-select v-model="form.value1" :disabled="ifedtie" placeholder="请选择年级" @change="choosegrade">
            <el-option
              v-for="item in gradeoptions"
              :key="item.gradeId"
              :label="item.gradeName"
              :value="item.gradeId"
            />
          </el-select>
          <el-select v-model="form.teachClass" :disabled="ifedtie" placeholder="请选择班级" @change="choosesclass">
            <el-option
              v-for="item in classoptions"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
          <el-select v-model="form.teachSubject" :disabled="ifedtie" placeholder="请选择科目" @change="choosesubject">
            <el-option
              v-for="item in subjectoptions"
              :key="item.subjectId"
              :label="item.subjectName"
              :value="item.subjectId"
            />
          </el-select>
          <svg-icon icon-class="add" style="font-size:30px;margin-left:10px;" @click="addnewline" />
        </el-form-item>
        <el-form-item label="所选科目信息：" :label-width="formLabelWidth">
          <el-table
            :data="subjectlist"
            style="width: 100%"
          >
            <el-table-column
              label="年级"
              width="180"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.gradeName }}</span>
              </template>

            </el-table-column>
            <el-table-column
              label="班级"
              width="180"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.className }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="科目"
              width="180"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.subjectName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="handleEdits(scope.$index, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="是否是班主任：" :label-width="formLabelWidth">
          <el-switch
            v-model="form.isDirector"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <div style="width: 50%;">
          <el-form-item label="后台账号：" :label-width="formLabelWidth">
            <el-input v-model="form.userCode" size="medium" placeholder="请输入" :disabled="ifedtie" @change="newrolename2" />
          </el-form-item>
          <el-form-item v-if="dialogtitle!=='成员信息'" label="密码设置：" :label-width="formLabelWidth">
            <el-input v-model="form.password" show-password autocomplete="off" placeholder="密码" :disabled="ifedtie" />
          </el-form-item>
        </div>
        <el-form-item v-if="dialogtitle==='成员信息'" label="最近修改时间：" :label-width="formLabelWidth">
          <el-input v-model="form.createTime" :disabled="ifedtie" />
        </el-form-item>
      </el-form>
      <div v-if="dialogtitle!=='成员信息'" slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addnewrole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import Vue from 'vue'
import md5 from 'js-md5'
import { pca, pcaa } from 'area-data'
import VueAreaLinkage from 'vue-area-linkage'
Vue.use(VueAreaLinkage)
import 'vue-area-linkage/dist/index.css'
export default {
  data() {
    return {
      classoptions: [], // 班级列表
      gradeoptions: [], // 年级列表
      schooloptions: [], // 成员列表
      groupoptions: [], // 分组列表
      sexoptions: [
        {
          value: '男',
          id: 1
        }, {
          value: '女',
          id: 2
        }
      ],
      subjectlist: [], // 添加的学科
      subjectoptions: [], // 学科列表
      pca: pca,
      pcaa: pcaa,
      selected: [],
      selectedform: [], // 三级联动
      tableData: [],
      schoolName: '',
      memberName: '', // 搜索
      schoolId: '',
      roleId: '',
      dialogtitle: '新增成员',
      dialogFormVisible: false,
      form: {
        createTime: 'date',
        schoolMemberId: 'id',
        memberName: '',
        schoolId: '',
        roleId: '',
        sex: [],
        contactWay: '',
        teachSubject: [],
        teachClass: [],
        userCode: '',
        password: '',
        adminId: 'id',
        isDirector: false,
        gradeName: '',
        className: '',
        subjectName: ''
      },
      value1: '',
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
    addnewline() {
      var list = {
        gradeId: this.form.value1,
        classId: this.form.teachClass,
        subjectId: this.form.teachSubject,
        gradeName: this.form.gradeName,
        className: this.form.className,
        subjectName: this.form.subjectName
      }
      this.subjectlist.push(list)
      console.log(this.subjectlist)
    },
    // 年级三级联动
    async chooseschool(e) { // 查询年级
      // console.log('点击')
      const cfg = {
        method: 'get',
        url: this.$URL + `/member/manager/getGradeInfoList/${e}`,
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.gradeoptions = res.data.data
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
    async choosegrade(e) { // 查询班级
      for (const item of this.gradeoptions) {
        if (e === item.gradeId) {
          this.form.gradeName = item.gradeName
        }
      }
      const cfg = {
        method: 'get',
        url: this.$URL + `/member/manager/getClassInfoByGId/${e}`,
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.classoptions = res.data.data
    },
    async choosesclass(e) {
      for (const item of this.classoptions) {
        if (e === item.classId) {
          this.form.className = item.className
        }
      }
      // console.log(this.form.teachClass)
    },
    choosesubject(e) {
      for (const item of this.subjectoptions) {
        if (e === item.subjectId) {
          this.form.subjectName = item.subjectName
        }
      }
    },
    changepage(e) {
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
        url: this.$URL + '/member/manager/getMemberInfoList',
        data: {
          pageSize: 10,
          page: this.currentpage,
          memberName: this.memberName,
          schoolId: this.schoolId,
          roleId: this.roleId
        },
        headers: 'json'
      }
      var res = await this.$http(cfg)
      console.log(res)
      this.tableData = res.data.data.rows
      this.total = res.data.data.records
      this.fullscreenLoading = false
    },
    async handleShow(index, row) {
      this.dialogFormVisible = true
      this.dialogtitle = '成员信息'
      this.ifedtie = true
      const cfg = {
        method: 'get', // 单个查询
        headers: 'json',
        url: this.$URL + `/member/manager/getMemberInfoById/${row.schoolMemberId}`
      }
      var ress = await this.$http(cfg)
      var date = this.resolvingDate(ress.data.data.createTime)
      var isDirector = ''
      if (ress.data.data.isDirector === 1) {
        isDirector = true
      } else {
        isDirector = false
      }
      this.form = {
        createTime: date,
        memberName: ress.data.data.memberName,
        schoolId: ress.data.data.schoolId,
        roleId: ress.data.data.roleId,
        sex: ress.data.data.sex,
        contactWay: ress.data.data.contactWay,
        teachSubject: ress.data.data.subjectStr,
        teachClass: ress.data.data.classStr,
        userCode: ress.data.data.userCode,
        isDirector: isDirector
      }
      this.subjectlist = ress.data.data.memberRelevanceVoList
    },
    handleEdits(index, row) {
      this.subjectlist.splice(index, 1)
    },
    async handleEdit(index, row) { // 编辑
      this.ifedtie = false
      this.dialogtitle = '修改成员'
      this.dialogFormVisible = true
      this.cuurentindex = index
      const cfg = {
        method: 'get',
        headers: 'json',
        url: this.$URL + `/member/manager/getMemberInfoById/${row.schoolMemberId}`
      }
      var ress = await this.$http(cfg)
      var isDirector = ''
      if (ress.data.data.isDirector === 1) {
        isDirector = true
      } else {
        isDirector = false
      }
      this.form = {
        adminId: ress.data.data.adminId,
        schoolMemberId: ress.data.data.schoolMemberId,
        memberName: ress.data.data.memberName,
        schoolId: ress.data.data.schoolId,
        roleId: ress.data.data.roleId,
        sex: ress.data.data.sex,
        contactWay: ress.data.data.contactWay,
        teachSubject: ress.data.data.subjectStr,
        // teachSubject: [1, 2],
        teachClass: ress.data.data.classStr,
        userCode: ress.data.data.userCode,
        isDirector: isDirector
      }
      this.subjectlist = ress.data.data.memberRelevanceVoList
      this.chooseschool(this.form.schoolId)
      // console.log(this.form, '111111111')
    },
    async handleDelete(index, row) {
      const cfg = {
        method: 'DELETE',
        url: this.$URL + `/member/manager/deleteMemberInfo/${row.schoolMemberId}`
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
      console.log(this.subjectlist, '22222222')
      var memberRelevanceList = []
      var s = []
      var sss = []
      for (var ite of this.subjectlist) {
        s.push(ite.classId)
        sss.push(ite.subjectId)
        memberRelevanceList.push({
          gradeId: ite.gradeId,
          classId: ite.classId,
          subjectId: ite.subjectId
        })
      }
      this.form.teachClass = s.join(',')
      this.form.teachSubject = sss.join(',')
      var isDirector = 1
      if (this.form.isDirector === true) {
        isDirector = 1
      } else {
        isDirector = 0
      }
      if (this.dialogtitle === '新增成员') {
        var list = {
          memberName: this.form.memberName,
          schoolId: this.form.schoolId,
          roleId: this.form.roleId,
          sex: this.form.sex,
          contactWay: this.form.contactWay,
          teachSubject: this.form.teachSubject,
          teachClass: this.form.teachClass,
          userCode: this.form.userCode,
          isDirector: isDirector,
          password: md5(this.form.password),
          memberRelevanceList: memberRelevanceList }
        const cfg = {
          method: 'POST',
          url: this.$URL + '/member/manager/addMemberInfo',
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
        console.log(this.form.password)
        if (this.form.password === undefined) {
          this.$message.error('请检查数据的完整性')
          return
        }
        const cfg = {
          method: 'PUT',
          url: this.$URL + '/member/manager/updateMemberInfo',
          data: {
            adminId: this.form.adminId,
            schoolMemberId: this.form.schoolMemberId,
            memberName: this.form.memberName,
            schoolId: this.form.schoolId,
            roleId: this.form.roleId,
            sex: this.form.sex,
            contactWay: this.form.contactWay,
            teachSubject: this.form.teachSubject,
            teachClass: this.form.teachClass,
            isDirector: isDirector,
            userCode: this.form.userCode,
            password: md5(this.form.password),
            memberRelevanceList: memberRelevanceList }
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
        url: this.$URL + '/member/manager/getSchoolRoleList',
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.groupoptions = res.data.data
      this.schooloptions = JSON.parse(Cookies.get('schoolInfos'))
      const cfg1 = {
        method: 'get',
        url: this.$URL + '/member/manager/getSubjectInfoList',
        headers: 'json'
      }
      var ress = await this.$http(cfg1)
      this.subjectoptions = ress.data.data
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
            list.push(item.schoolMemberId)
          }
        }
        var lists = list.join(',')
        const cfg = {
          method: 'DELETE',
          url: this.$URL + `/member/manager/deleteMemberInfo/${lists}`
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
