<template>
  <div class="app-container">
    <div class="filter-container" style="margin:0 20px;">
      <div style="display:inline-block;">
        <label class="radio-label" style="padding:0 10px;font-weight:500;font-size:16px;">  域名类型： </label>
        <el-select v-model="listQuery.domainType" placeholder="请选择" clearable style="width: 130px" class="filter-item">
          <el-option
            v-for="item in DomainType"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <div style="display:inline-block;">
        <label class="radio-label" style="padding:0 10px;font-weight:500;font-size:16px;">   域名状态： </label>
        <el-select v-model="listQuery.domainStatus" placeholder="请选择" clearable class="filter-item" style="width: 130px">
          <el-option
            v-for="item in DomainStatus"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <el-input v-model="listQuery.domainName" placeholder="请输入域名" style="width: 200px;" class="filter-item" @blur="handleFilter" />
      <el-input v-model="listQuery.mediumName" placeholder="请输入媒介" style="width: 200px;" class="filter-item" @blur="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilters">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;background-color:red;border:none;" type="primary" icon="el-icon-delete" @click="clearSearch">
        清空
      </el-button>
    </div>
    <div class="filter-container"  style="margin:0 30px;">
      <el-button class="filter-item" style="margin-left: 10px;background-color:red;border:none; margin:20px 20px 0 0;" type="primary" icon="el-icon-delete" @click="deleteAll">
        批量删除
      </el-button>
      <el-button :loading="downloadLoading" style="margin:20px 20px 0 0;" type="primary" icon="el-icon-document" @click="handleDownload">
        导出
      </el-button>
      <el-button :loading="downloadLoading" style="margin:20px 20px 0 0;" type="primary" icon="el-icon-document" @click="handleDownload">
        导入
      </el-button>
      <el-button :loading="downloadLoading" style="margin:20px 20px 0 0;" type="primary" @click="showAddDomainView">
        添加域名
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
        />
        <el-table-column
          label="域名"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.domainName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="媒介专员"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.mediumName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.domainStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="类型"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.domainType }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="添加时间"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.updateTime }}</span>
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
    <el-dialog :title="dialogtitle" :visible.sync="dialogFormVisible" width="60%">
      <el-form ref="dynamicValidateForm" :model="dynamicValidateForm" label-width="100px" class="demo-dynamic">
        <div style="display:inline-block;color:black;margin-left:-80px;">
          <el-form-item>
            <label class="radio-label" style="padding:0 10px 0 10px;font-weight:500;font-size:15px;"> 媒介专员</label>
            <el-select v-model="dynamicValidateForm.mediumId" placeholder="请选择媒介专员" clearable class="filter-item" style="width: 130px">
              <el-option
                v-for="item in mediumInfoList"
                :key="item.userId"
                :label="item.username"
                :value="item.userId"
              />
            </el-select>
        </el-form-item>
      </div>
        <el-form-item style="margin-top:20px;"
          v-for="(domain, index) in dynamicValidateForm.domains"
          :key="domain.key"
          :label="'域名' + (++index)"
          :rules="{
            required: true, message: '域名不能为空', trigger: 'blur'
          }"
        >
          <el-input v-model="domain.domainName" style="width:30%;margin-right:10px;" @change="isExistsDomain(index)"/>
          <el-select v-model="domain.domainType" placeholder="请选择">
            <el-option
              v-for="item in DomainType"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />         
          </el-select>
          <el-button @click.prevent="removeDomain(domain)">删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('dynamicValidateForm')">提交</el-button>
          <el-button @click="addDomain">新增域名</el-button>
          <el-button @click="resetForm('dynamicValidateForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog :title="dialogUpdateTitle" :visible.sync="dialogFormUpdateDomain" width="50%">
      <el-form :model="form">
        <el-form-item label="媒介专员" :label-width="formLabelWidth">
          <div style="display:inline-block;">
            <el-select v-model="form.mediumId" placeholder="请选择上级用户" clearable class="filter-item" style="width: 130px">
                 <el-option
                    v-for="item in mediumInfoList"
                    :key="item.userId"
                    :label="item.username"
                    :value="item.userId"
                  />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="域名" :label-width="formLabelWidth">
          <el-input v-model="form.domainName" autocomplete="off" :disabled="true" />
        </el-form-item>
        <el-form-item label="域名类型" :label-width="formLabelWidth">
          <div style="display:inline-block;">
            <el-select v-model="form.domainType" placeholder="请选择域名类型" clearable class="filter-item" style="width: 130px">
              <el-option v-for="item in DomainType" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="域名状态" :label-width="formLabelWidth">
          <div style="display:inline-block;">
            <el-select v-model="form.domainStatus" placeholder="请选择域名状态" clearable class="filter-item" style="width: 130px">
              <el-option v-for="item in DomainStatus" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormUpdateDomain = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdateSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
export default {
  name: 'Domainlist',
  data() {
    return {
      total: 0,
      count: 10,
      fullscreenLoading: false, // 加载动画
      currentpage: 1,
      tableData: [],
      leaderUserList: [],//媒介列表
      DomainType: [
        {
          id: 'FLOOR',
          name: '落地'
        },
        {
          id: 'GOTO',
          name: '跳转'
        }
      ],
      DomainStatus: [
        {
          id: 'NORMAL',
          name: '正常'
        },
        {
          id: 'INTERCEPT',
          name: '拦截'
        },
        {
          id: 'EXCEPTION',
          name: '备案异常'
        },
        {
          id: 'BACKUP',
          name: '备用'
        }
      ],
      mediumList: [],
      list: [],
      downloadLoading: false, // 导出加载
      listLoading: true,
      dialogFormVisible: false,
      dialogFormUpdateDomain:false,
      filename: '',
      autoWidth: true,
      bookType: 'xlsx',
      listQuery: {
        domainType: '', // 域名domain
        domainStatus: '', // 域名状态
        domainName: '', // 域名名字
        mediumName: '' // 媒介
      },
      form: {
        domainId:'',//域名id
        mediumId: '', // 媒介id
        domainName: '', // 域名名称
        domainType: '', // 域名类型
        domainStatus: ''// 域名状态
      },
      multipleSelection: [],
      dialogtitle: '新增域名',
      dialogUpdateTitle: '编辑域名',
      formLabelWidth: '100px',
      domainlist: [],
      dynamicValidateForm: { // 新增域名
        domains: [{
          domainName: '',
          domainType: '',
          key:''
        }],
        mediumId:''
      },
      mediumInfoList:[],
      isExist:false
    }
  },
  created() {
    this.showAll(),
    this.getLeaderUserList()
  },
  methods: {
    showAddDomainView(){
      this.dialogFormVisible = true
      this.dialogtitle = '新增域名'
      this.dynamicValidateForm= { // 新增域名
        domains: [{
          domainName: '',
          domainType: '',
          key:''
        }],
        mediumId:''
      }
    },
    async isExistsDomain(index){
      var domain=this.dynamicValidateForm.domains[--index]
      var domainName = domain.domainName;
      if(domainName==null || domainName=='' ||domainName=='undefined'){
        this.$message({
          message: '域名不能为空',
          type: 'error'
        })
        return 
      }
      const cfg = {
        method: 'get',
        url: this.$URL + `/sys/domain/isExistsDomain/${domainName}`,
        headers: 'json',
      }
       var res = await this.$http(cfg)
       if(res.data.status == 200){
          this.$message({
            message: '该域名可以使用',
            type: 'success'
          })
       }else{
         this.$message({
            message: '该域名已被使用',
            type: 'error'
          })
          this.isExist=true;
       }
    },
    async getLeaderUserList(){
      const cfg = {
        method: 'post',
        url: this.$URL + '/sys/domain/getLeaderUserList',
        headers: 'json',
      }
      var res = await this.$http(cfg)
      this.mediumInfoList = res.data.data
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
        url: this.$URL + '/sys/domain/getDomainInfoList',
        data: domainQuery,
        headers: 'json',
      }
      var res = await this.$http(cfg)
      this.tableData = res.data.data.records
      this.total = res.data.data.total
      this.fullscreenLoading = false
    },
    clearSearch() {
      this.listQuery = {}
    },
    handleFilters() {
      this.showAll()
    },
    handleDownload() { // 导出
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['域名', '媒介专员', '状态', '类型', '添加时间']
        const filterVal = ['id', 'title', 'author', 'pageviews', 'display_time']
        const list = this.list
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.filename,
          autoWidth: this.autoWidth,
          bookType: this.bookType
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    handleFilter() {
      // this.showAll()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    async submitForm(formName) { // 添加多条域名信息
      if(this.isExist===true){
         this.$message({
              message: '所添加的域名已被占用~',
              type: 'error'
        })
        return 
      }
      var mediumId=this.dynamicValidateForm.mediumId
      var domainList=this.dynamicValidateForm.domains;
      if(mediumId==null||mediumId==''){
        this.$message({
              message: '媒介不能为空',
              type: 'error'
        })
        return 
      }
      if(domainList.length<1){
        this.$message({
              message: '请添加一条所属媒介域名信息',
              type: 'error'
        })
        return 
      }
      var flag=false;
        for(var i=0;i<domainList.length;i++){
          if(domainList[i].domainName==null||domainList[i].domainName==''){
            this.$message({
              message: '第'+(++i)+'个域名名称为空',
              type: 'error'
            })
            return 
          }else if(domainList[i].domainType==null||domainList[i].domainType==''){
            this.$message({
              message: '第'+(++i)+'个域名类型为空',
              type: 'error'
            })
            return 
          }else{
            domainList[i].mediumId=mediumId;
            flag=true;
          }
        }
        if(flag==false){
          return 
        }
        const cfg = {
          method: 'post', // 单个查询
          headers: 'json',
          url: this.$URL + `/sys/domain/addDomain`,
          data:JSON.stringify(domainList)
        }
      var ress = await this.$http(cfg)
      if(ress.data.status==200){
          this.$message({
            message: '添加成功',
            type: 'success'
          })
      }else{
          this.$message({
            message: '添加失败',
            type: 'success'
          })
      }
      this.dialogFormVisible =false
      this.showAll()
    },
    resetForm(formName) { // 重置域名
      this.dynamicValidateForm={ // 新增域名
        domains: [{
          domainName: '',
          domainType: '',
          key:''
        }],
        mediumId:''
      }
    },
    removeDomain(item) { // 删除域名
      var index = this.dynamicValidateForm.domains.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm.domains.splice(index, 1)
      }
    },
    addDomain() {
      this.dynamicValidateForm.domains.push({
        domainName: '',
        domainType: '',
        key: Date.now()
      })
    },
    // 编辑一条信息
    async handleEdit(index, row) {
      this.ifedtie = false
      this.dialogFormUpdateDomain = true
      this.cuurentindex = index
      const cfg = {
        method: 'get', // 单个查询
        headers: 'json',
        url: this.$URL + `/sys/domain/getDomainById?domainId=` + row.domainId
      }
      var ress = await this.$http(cfg)
      this.form = {
        domainId:ress.data.data.domainId,//域名id
        mediumId: ress.data.data.mediumId, // 媒介id
        domainName: ress.data.data.domainName, // 域名名称
        domainType: ress.data.data.domainType, // 域名类型
        domainStatus: ress.data.data.domainStatus// 域名状态
      }
    },
    //更新一条域名信息
    async handleUpdateSave(){
      const cfg = {
        method: 'PUT',
        url: this.$URL + `/sys/domain/updateDomain`,
        data:this.form
      }
      var res = await this.$http(cfg)
      if (res.data.status === 200) {
        this.$message({
          message: '更新成功',
          type: 'success'
        })
      }
       this.showAll()
       this.dialogFormUpdateDomain=false
        // console.log('提交的信息是》》》》》》》》'+JSON.stringify(this.form))
    },
    // 删除一条域名信息
    async handleDelete(index, row) {
      var list = []
      list.push(row.domainId)
      const cfg = {
        method: 'DELETE',
        url: this.$URL + `/sys/domain/delDomainInfo/${list}`
      }
      var res = await this.$http(cfg)
      if (res.data.status === 200) {
        this.$message({
          message: '删除成功',
          type: 'success'
        })
      }
      this.showAll()
    },
    async deleteAll() { // 删除选中的
      if (this.multipleSelection.length === 0) {
        this.$message.error('请选择删除对象')
      } else {
        var list = []
        for (var item of this.multipleSelection) {
          if (this.tableData.includes(item)) {
            list.push(item.id)
          }
          const cfg = {
          // 删除按钮接口
            method: 'DELETE',
            url: this.$URL + `/sys/domain/delDomainInfo/${list}`
          }
          var res = await this.$http(cfg)
          if (res.data.status === 200) {
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
}
</script>
