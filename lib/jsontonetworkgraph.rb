require 'json'
load 'node.rb'
load 'link.rb'

class JSONToNetworkGraph

  def initialize(input, field1, field2)
    @input = JSON.parse(File.read(input))
    @field1 = field1
    @field2 = field2
    @nodehash = Hash.new
    @linkhash = Hash.new
    @nodeindex = 0
  end

  # Generate all the nodes
  def genNodes
    @input.each do |i|
      addupdateNode(@field1, i)
      addupdateNode(@field2, i)
    end
  end

  # Create or update the appropriate node
  def addupdateNode(fieldname, i)
    if !(@nodehash.include? i[fieldname])
      @nodehash[i[fieldname]] = Node.new(@nodeindex, i[fieldname], fieldname, i)
      @nodeindex += 1
    else
      @nodehash[i[fieldname]].update(i)
    end
  end

  # Generate all the links
  def genLinks
    @input.each do |i|
      identifier = i[@field1]+ "-" + i[@field2]
      if !@linkhash.include? identifier
        source = @nodehash[i[@field1]].getID
        target = @nodehash[i[@field2]].getID

        @linkhash[identifier] = Link.new(source, target, identifier, i)
      else
        @linkhash[identifier].update(i)
      end
    end
  end

  # Generate JSON with nodes and links
  def genJSON
    genNodes
    genLinks
    
    nodearray = Array.new
    @nodehash.each_value do |n|
      nodearray.push(n.nodeData)
    end

    linkarray = Array.new
    @linkhash.each_value do |l|
      linkarray.push(l.linkData)
    end

    jsonarray = [:nodes => nodearray, :links => linkarray]
    puts JSON.pretty_generate(jsonarray)
  end

end


