<template>
  <div class="app-container">
    <div class="filter-container" style="margin:0px 20px;">
      <el-input v-model="listQuery.username" placeholder="请输入用户名" style="width: 200px;" class="filter-item" @blur="handleFilter" />
      <el-input v-model="listQuery.realName" placeholder="请输入真实姓名" style="width: 200px;" class="filter-item" @blur="handleFilter" />
      <div style="display:inline-block;">
        <label class="radio-label" style="padding:0 10px;font-weight:500;font-size:16px;">  角色 </label>
        <el-select v-model="listQuery.roleId" placeholder="请选择" clearable style="width: 130px" class="filter-item">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilters">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;background-color:red;border:none;" type="primary" icon="el-icon-delete" @click="clearSearch">
        清空
      </el-button>
    </div>
    <div class="filter-container"  style="margin:0px 25px;">
      <el-button :loading="downloadLoading" style="margin:20px 20px 0 0;" type="primary" @click="dialogFormVisible = true,dialogtitle = '新增管理员',form= {}">
        新增管理员
      </el-button>
    </div>
    <div style="margin:30px 15px;">
      <el-table
        border=""
        :header-cell-style="{'background-color':'#F5F7FA','text-align':'center'}"
        :cell-style="{'text-align':'center'}"
        ref="multipleTable"
        v-loading="fullscreenLoading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column
          label="ID"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.userId }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="用户名"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="真实姓名"
        >
          <template slot-scope="scope">
            <span> {{ scope.row.realName }} </span>
          </template>
        </el-table-column>
        <el-table-column
          label="最后登录IP"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.lastLoginIp }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="最后登录时间"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.lastLoginTime!=null">{{ resolvingDate(scope.row.lastLoginTime ) }}</span>
            <span v-else>该用户未登录过</span>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.status=='PROHIBIT'">已拉黑</span>
            <span v-else>正常</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status!='LOCKED'"
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
            <el-button
              v-if="scope.row.status=='NORMAL'||scope.row.status=='LOCKED'"
              size="mini"
              :disabled="scope.row.status==='LOCKED'?true : false"
              type="danger"
              @click="handleUpdateStatusStop(scope.$index, scope.row,0)"
            >拉黑</el-button>
            <el-button
              v-if="scope.row.status==='PROHIBIT'"
              size="mini"
              type="danger"
              @click="handleUpdateStatusStart(scope.$index, scope.row,1)"
            >启用</el-button>
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
        <el-form-item label="媒介专员" :label-width="formLabelWidth">
          <div style="display:inline-block;">
            <el-select v-model="form.leaderId" placeholder="请选择上级用户" clearable class="filter-item" style="width: 130px" @change="choose">
              <el-option v-for="item in leaderUserList" :key="item.userId" :label="item.username" :value="item.userId" />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input v-if="dialogtitle == '修改管理员'" v-model="form.username" autocomplete="off" placeholder="请输入用户名" :disabled="true" />
          <el-input v-if="dialogtitle == '新增管理员'" v-model="form.username" autocomplete="off" placeholder="请输入用户名" @change="changeUsername" />
          <el-link v-if="dialogtitle == '新增管理员'" type="info" icon="el-icon-view">初始密码默认为“@QD1234”登录后请务必修改</el-link>
        </el-form-item>
        <el-form-item label="真实姓名" :label-width="formLabelWidth">
          <el-input v-model="form.realName" autocomplete="off" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth">
          <el-input v-model="form.phoneNumber" autocomplete="off" placeholder="请输入手机号" />
          <el-link type="info" icon="el-icon-view">手机号以13/15/17/18开头的11位数字 </el-link>
        </el-form-item>
        <el-form-item v-if="dialogtitle == '修改管理员'" label="密码" :label-width="formLabelWidth">
          <el-input v-if="dialogtitle == '修改管理员'" v-model="form.username" autocomplete="off" placeholder="请输入密码" show-password :disabled="true" />
          <el-input v-if="dialogtitle == '新增管理员'" v-model="form.password" autocomplete="off" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" :label-width="formLabelWidth">
          <el-checkbox-group v-model="roleIds" @change="checkRoleIds">
            <el-checkbox v-for="item in roleList" :key="item.roleId" v-model="roleId" :label="item.roleId" :value="item.roleId">{{ item.roleName }}</el-checkbox>
          </el-checkbox-group>
          <!-- <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
               <div style="margin: 15px 0;"></div>
              <el-checkbox-group v-model="form.roleId" @change="handleCheckedCitiesChange">
                <el-checkbox v-for="item in roleList" :label="item.roleId" :value="item.roleId" :key="item.roleId">{{item.roleName}}</el-checkbox>
              </el-checkbox-group> -->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateUserInfo">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import md5 from 'js-md5'
export default {
  name: 'Managelist',
  data() {
    return {
      total: 0,
      count: 10,
      fullscreenLoading: true,
      currentpage: 1,
      tableData: [],
      roleList: [],
      leaderUserList: [],
      downloadLoading: false, // 导出加载
      listLoading: true,
      dialogFormVisible: false,
      autoWidth: true,
      listQuery: {
        username: null, // 用户名
        realName: null, // 真实姓名
        roleId: null // 角色id
      },
      form: {
        userId: '',
        leaderId: '', // 上级用户id
        username: '', // 用户名
        realName: '', // 真实姓名
        phoneNumber: '', // 手机号
        password: '', // 密码
        roleId: '' // 角色id
      },
      multipleSelection: [],
      dialogtitle: '新增管理员',
      formLabelWidth: '100px',
      domainlist: [],
      checkAll: false,
      isIndeterminate: true,
      cuurentindex: 0,
      roleIds: [],
      roleId: ''
    }
  },
  created() {
    this.showAll(),
    this.selectRoleList()
    this.selectLeaderUserList()
  },
  resolvingDate(item) {
    return this.resolvingDate(item)
  },
  methods: {
    choose(e) {
      console.log(this.form.leaderId)
    },
    async changeUsername() {
      if (this.form.username == null || this.form.username == '') {
        this.$message({
          message: '输入不能为空',
          type: 'error'
        })
        return
      }
      const cfg = {
        method: 'post',
        url: this.$URL + '/sys/user/changeUsername?username=' + this.form.username,
        headers: 'json'
      }
      var res = await this.$http(cfg)
      if (res.data.status === 200) {
        this.$message({
          message: '该用户可以使用',
          type: 'success'
        })
      } else {
        this.$message({
          message: '该用户已存在',
          type: 'error'
        })
      }
    },
    async selectRoleList() { // 首次加载获取角色
      const cfg = {
        method: 'post',
        url: this.$URL + '/sys/user/getRoleInfoList',
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.roleList = res.data.data
    },
    async selectLeaderUserList() { // 首次加载获取上級用户id
      const cfg = {
        method: 'post',
        url: this.$URL + '/sys/user/getLeaderUserList',
        headers: 'json'
      }
      var res = await this.$http(cfg)
      this.leaderUserList = res.data.data
    },
    changepage(e) {
      this.currentpage = e
      this.showAll()
    },
    async showAll() {
      var domainQuery = this.listQuery
      domainQuery.pageNum = this.currentpage
      domainQuery.pageSize = 10
      const cfg = {
        method: 'post',
        url: this.$URL + '/sys/user/getUserInfoList',
        headers: 'json',
        data: domainQuery
      }
      var res = await this.$http(cfg)
      this.tableData = res.data.data.records
      this.total = res.data.data.total
      this.fullscreenLoading = false
    },
    clearSearch() {
      this.listQuery = {},
      console.log('搜索')
    },
    handleFilters() {
      this.showAll()
      console.log(this.listQuery)
    },
    handleFilter() {
      // this.showAll()
      console.log('按下')
    },
    handleSelectionChange(val) {
      // console.log(val, '222222')
      this.multipleSelection = val
    },
    // 新增或更新一条管理员信息
    async addOrUpdateUserInfo() {
      const regUserName = /^[\u4E00-\u9FA5A-Za-z0-9]+$/ // 用户名正则
      if (regUserName.test(this.form.username) == false || this.form.username == '' || this.form.username == null) {
        this.$message({
          message: '用户名输入为空或格式不正确',
          type: 'error'
        })
        return
      }
      const regNickName = /^[\u4E00-\u9FA5A-Za-z0-9]+$/ // 真实姓名正则
      if (regNickName.test(this.form.realName) == false || this.form.realName == '' || this.form.realName == null) {
        this.$message({
          message: '真实姓名输入为空或格式不正确',
          type: 'error'
        })
        return
      }
      const regMobile = /^((13[0-9])|(15[0-9])|(18[0,2,3,5-9])|(17[0-8])|(147))\d{8}$/ // 手机号正则
      if (regMobile.test(this.form.phoneNumber) == false || this.form.phoneNumber == '' || this.form.phoneNumber == null) {
        this.$message({
          message: '手机格式不正确',
          type: 'error'
        })
        return
      }
      var roleId = this.roleIds.join(',')
      console.log('表单', this.form)
      console.log('上级用户id', this.form.leaderId)
      if (this.dialogtitle === '新增管理员') {
        var list = {
          leaderId: this.form.leaderId,
          username: this.form.username,
          realName: this.form.realName,
          phoneNumber: this.form.phoneNumber,
          password: md5('@QD1234'),
          roleId: roleId
        }
        const cfg = {
          method: 'POST',
          url: this.$URL + '/sys/user/addAdmin',
          data: list
        }
        var res = await this.$http(cfg)
        if (res.data.status === 200) {
          this.$message({
            message: '添加成功',
            type: 'success'
          })
        }
      } else {
        const cfg = {
          method: 'PUT',
          url: this.$URL + '/sys/user/updateAdmin',
          data: {
            userId: this.form.userId,
            leaderId: this.form.leaderId,
            // username: this.form.username,
            realName: this.form.realName,
            phoneNumber: this.form.phoneNumber,
            password: this.form.password,
            roleId: roleId
          }
        }
        var ress = await this.$http(cfg)
        if (ress.data.status === 200) {
          this.$message({
            message: '编辑成功',
            type: 'success'
          })
        }
      }
      this.showAll()
      this.dialogFormVisible = false
    },
    checkRoleIds(val) {
      console.log('roleIds', val)
    },
    // 编辑一条信息
    async handleEdit(index, row) {
      this.dialogtitle = '修改管理员'
      // console.log('>>>>>>>>>>'+this.dialogtitle)
      this.ifedtie = false
      this.dialogFormVisible = true
      this.cuurentindex = index
      // var ress = await this.$http(cfg)
      this.form = this.tableData[index]
      console.log(this.form)
      this.roleIds = (this.form.roleIds.split(',')).map(Number)
    },
    //启用一条管理员信息
    async handleUpdateStatusStart(index, row,status) {
      const cfg = {
        method: 'PUT',
        url: this.$URL + `/sys/user/updateStatusStart?status=${status}&userId=${this.tableData[index].userId}`      
      }
      var res = await this.$http(cfg)
      if (res.data.status === 200) {
        this.$message({
          message: '启用成功',
          type: 'success'
        })
      }
      this.showAll()
    },
    //拉黑一条管理员信息
    async handleUpdateStatusStop(index, row,status) {
      const cfg = {
        method: 'PUT',
        url: this.$URL + `/sys/user/updateStatusStop?status=${status}&userId=${this.tableData[index].userId}`      
      }
      var res = await this.$http(cfg)
      if (res.data.status === 200) {
        this.$message({
          message: '拉黑成功',
          type: 'success'
        })
      }
      this.showAll()
    },
    handleCheckAllChange(val) {
      this.checkedCities = val ? this.roleList : []
      console.log('checkedCities', this.checkedCities)
      this.isIndeterminate = false
    },
    // 复选框状态改变
    changeFun(val) {
      console.log(val)
      // this.multipleSelection = val;
    }
  }
}
</script>
