<template>
  <div class="app-container">
    <div class="filter-container" style="margin:0 20px;">
        <el-input v-model="queryEntity.partnerName" placeholder="请输入合作商名称" style="width: 200px;" class="filter-item" @blur="handleFilter" />
        <el-input v-model="queryEntity.mediumName" placeholder="请输入媒介归属名称" style="width: 200px;" class="filter-item" @blur="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilters">
        搜索
      </el-button>
    </div>
     <div class="filter-container"  style="margin:0 30px;">
      <el-button style="margin:20px 20px 0 0;" type="primary" @click="showAddDomainView">
        新建合作商
      </el-button>
    </div>
    <div style="margin:30px 25px;">
      <el-table
        ref="multipleTable"
        border=""
        :header-cell-style="{'background-color':'#F5F7FA','text-align':'center'}"
        :cell-style="{'text-align':'center'}"
        v-loading="fullscreenLoading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column
          label="ID编号"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.partnerId }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="合作商名称"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.partnerName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="媒介归属"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.mediumName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="最近一次修改时间"
        >
        <template slot-scope="scope">
            <span>{{ resolvingDate(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
            <el-button v-if="scope.row.status==='禁用'"
              size="mini"
              @click="handleUpdateState(scope.$index, scope.row,'NORMAL')"
            >启用</el-button>
            <el-button v-else 
              size="mini"
              @click="handleUpdateState(scope.$index, scope.row,'PROHIBIT')"
            >禁用</el-button>
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
    <el-dialog :title="dialogtitle" :visible.sync="dialogFormVisible" width="25%">
      <el-form :model="form">
        <el-form-item label="合作商名称" :label-width="formLabelWidth">
          <el-input v-model="form.partnerName" autocomplete="off" placeholder="请输入合作商名称"/>
        </el-form-item>
         <el-form-item label="状态" :label-width="formLabelWidth">
          <div style="display:inline-block;">
            <el-select v-model="form.status" placeholder="请选择状态" clearable class="filter-item" style="width: 130px">
              <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdatePartner">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import { parseTime } from '@/utils'
export default {
  data() {
    return {
      queryEntity:{
        partnerName:'', //合作商名称
        mediumName:''       //媒介归属名称
      },
      tableData: [],
      dialogtitle: '新建合作商',
      dialogFormVisible: false,
      form: {
        partnerId: '',   //合作商id
        partnerName: '',  //合作商名称
        createId:'',      //媒介归属id
        status:''
      },
      formLabelWidth: '100px',
      statusList: [
        {
          id:'PROHIBIT',
          name:'禁止'
        },
        {
          id:'NORMAL',
          name: '启用'
        }
      ],
      userinfo:{},
      cuurentindex: 0,
      total: 0,
      count: 10,
      currentpage: 1,
      searchname: '',
      fullscreenLoading: true
    }
  },
  resolvingDate(item) {
    return this.resolvingDate(item)
  },
  created() {
    this.showAll()
    this.showUserInfo()
  },
  methods: {
    showUserInfo(){
      this.userinfo =JSON.parse(Cookies.get('userInfo'))
    },
     showAddDomainView(){
      this.dialogFormVisible= true
      this.dialogtitle = '新建合作商'
      this.form={}
    },
    handleFilter(){

    },
    handleFilters(){
        this.showAll()
    },
    changepage(e) {
      this.currentpage = e
      this.showAll()
    },
    search(e) {
      this.searchname = e
      this.showAll()
    },
    async showAll() {
      var partner=this.queryEntity
      partner.pageNum=this.currentpage
      partner.pageSize=10
      const cfg = {
        method: 'POST',
        url: this.$URL + '/sys/partner/getPartnerInfo',
        headers: 'json',
        data: partner
      }
      var res = await this.$http(cfg)
      this.tableData = res.data.data.records
      this.total = res.data.data.total
      this.fullscreenLoading = false
    },
    handleEdit(index, row) {
      this.dialogtitle = '编辑合作商'
      this.dialogFormVisible = true
      this.cuurentindex = index
      this.form.partnerId = row.partnerId
      this.form.partnerName = row.partnerName
      this.form.createId = row.createId
      this.form.status = row.status
    },
    async handleDelete(index, row) {
      const cfg = {
        method: 'DELETE', // 删除代替GET
        url: this.$URL + `/sys/partner/delPartner/${row.partnerId}`
      }
      var ress = await this.$http(cfg)
      if (ress.data.status === 200) {
        this.$message({
          message: '删除成功',
          type: 'success'
        })
      }
      this.showAll()
    },
    async handleUpdateState(index, row,status) {
        const cfg = {
          method: 'POST',
          url: this.$URL + `/sys/partner/updateStatus/${row.partnerId}/${status}`
        }
        var res = await this.$http(cfg)
        if (res.data.status === 200) {
          this.$message({
            message: '编辑成功',
            type: 'success'
          })
        }
        this.showAll()
    },
    async addOrUpdatePartner() { // 新增或修改合作商
      if (this.form.partnerName === '') {
        this.$message.error('请填写合作商名称')
        return 
      } 
      if (this.form.status === '') {
        this.$message.error('请选择状态')
        return 
      } 
      if (this.dialogtitle === '新建合作商') {
        this.form.createId=this.userinfo.userId
        const cfg = {
          method: 'POST',
          url: this.$URL + '/sys/partner/addPartner',
          data:  this.form
        }
        var res = await this.$http(cfg)
        if (res.data.status === 200) {
          this.$message({
            message: '添加成功',
            type: 'success'
          })
        }
        this.showAll()
        this.dialogFormVisible = false
      } else {
        this.dialogFormVisible = false
        const cfg = {
          method: 'PUT',
          url: this.$URL + '/sys/partner/updatePartner',
          data: this.form
        }
        var ress = await this.$http(cfg)
        if (ress.data.status === 200) {
          this.$message({
            message: '编辑成功',
            type: 'success'
          })
        }
        this.showAll()
      }
    }
  }
}
</script>
<style scoped>
  .demo-input-suffix {
    width: 40%;
    margin: 20px auto;
    display: flex;
  }
</style>
